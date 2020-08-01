import sys
import os
import aiomysql
from dotenv import load_dotenv

load_dotenv()


# Print and flush stdout
def print_flush(string):
    print(string)
    sys.stdout.flush()


class DBconnection:

    def __init__(self, table_name):
        self.newT_continueF = True
        self.counter = 0
        self.timestamps = []
        self.db = os.getenv('DATABASE_DDA')
        self.tb = table_name
        self.DDAtb = "dda_"+table_name
        self.pool = None
        self.tries_amount = 10

    # __init__ can't be async so this function need's to be called after an object of the class is created.
    async def init_extender(self, number_of_players):
        for i in range(number_of_players):
            self.timestamps.append(0)

        self.pool = await aiomysql.create_pool(user=os.getenv('USER'), password=os.getenv('PASSWORD'),
                                               host=os.getenv('HOST_DDA'), db=self.db, port=int(os.getenv('PORT_DDA')),
                                               auth_plugin='mysql_native_password', autocommit=True)

        # Check if the instance's temporary DDA table already exists - and if so it means the instance was interrupted.
        # If true - get the last timestamp for each player's level change.
        # else - create the instance's temporary DDA table.
        exists = None
        tries = self.tries_amount
        while exists is None and tries > 0:
            exists = await self.check_if_table_exist()
            tries -= 1
        if exists:
            ret_flag = False
            tries = self.tries_amount
            while ret_flag is False and tries > 0:
                ret_flag = await self.init_timestamps()
                tries -= 1
            self.newT_continueF = False
        else:
            ret_flag = False
            tries = self.tries_amount
            while ret_flag is False and tries > 0:
                ret_flag = await self.create_dda_table()
                tries -= 1

    # Checks if the instance's temporary DDA table already exists.
    async def check_if_table_exist(self):
        try:
            async with self.pool.acquire() as con:
                async with con.cursor() as cursor:
                    await cursor.execute("SHOW TABLES")
                    fetch = await cursor.fetchall()

                    for result in fetch:
                        if result[0] == self.DDAtb:
                            return True

                    return False

        except Exception as e:
            print_flush("check_if_table_exist exception: " + str(e))
            return None

    # Sets the timestamp for each player's last level change in case the game instance was interrupted.
    async def init_timestamps(self):
        query = ("SELECT PlayerID, format(max(Timestamp), 3) as max_ts FROM " + self.db + "." + self.DDAtb +
                 " WHERE Level != 0 GROUP BY PlayerID")

        try:
            async with self.pool.acquire() as con:
                async with con.cursor() as cursor:
                    await cursor.execute(query)
                    fetch = await cursor.fetchall()

                    for result in fetch:
                        if result[0] is not None and result[1] is not None:
                            self.timestamps[result[0] - 1] = result[1]

                    return True

        except Exception as e:
            print_flush("init_timestamps exception: " + str(e))
            return False

    # Create the instance's temporary DDA table.
    async def create_dda_table(self):
        query = ("CREATE TABLE `" + self.db + "`.`" + self.DDAtb + "` ("
                 "`Id` INT UNSIGNED NOT NULL AUTO_INCREMENT,"
                 "`PlayerID` INT UNSIGNED NOT NULL,"
                 "`Penalty` FLOAT NOT NULL,"
                 "`Bonus` FLOAT NOT NULL,"
                 "`Skill` FLOAT NOT NULL,"
                 "`Level` INT NOT NULL,"
                 "`Timestamp` FLOAT NOT NULL,"
                 "PRIMARY KEY (`Id`))"
                 "DEFAULT CHARACTER SET = UTF8MB4;")

        try:
            async with self.pool.acquire() as con:
                async with con.cursor() as cursor:
                    await cursor.execute(query)

                    return True

        except Exception as e:
            print_flush("create_dda_table: " + str(e))
            return False

    # Calculate the player's level when the game instance was interrupted.
    async def get_levels(self, number_of_players):
        query = ("SELECT PlayerID, Level FROM " + self.db + "." + self.DDAtb + " ORDER BY Timestamp ASC")

        levels = []
        for i in range(number_of_players):
            levels.append(0)

        try:
            async with self.pool.acquire() as con:
                async with con.cursor() as cursor:
                    await cursor.execute(query)
                    fetch = await cursor.fetchall()

                    for result in fetch:
                        if result[0] != 0 and result[0] is not None and result[1] is not None:
                            if not (levels[result[0] - 1] == 6 and result[1] == 1) and\
                                    not (levels[result[0] - 1] == 1 and result[1] == -1):
                                levels[result[0] - 1] += result[1]

                    return levels

        except Exception as e:
            print_flush("get_levels exception: " + str(e))
            return None

    # Delete the temporary DDA table.
    async def remove_dda_table(self):
        query = ("DROP TABLE `" + self.db + "`.`" + self.DDAtb + "`")

        try:
            async with self.pool.acquire() as con:
                async with con.cursor() as cursor:
                    await cursor.execute(query)

                    return True

        except Exception as e:
            print_flush("remove_dda_table exception: " + str(e))
            return False

    # Close connection to the DB.
    async def close_connection(self):
        ret_flag = False
        tries = self.tries_amount
        while ret_flag is False and tries > 0:
            ret_flag = await self.remove_dda_table()
            tries -= 1
        self.pool.close()
        await self.pool.wait_closed()

    # Get the timestamp and game mode from the last game event.
    async def get_timestamp_gamemode(self):
        query = ("SELECT format(Timestamp, 3), GameMode FROM " + self.db + "." + self.tb +
                 " ORDER BY Timestamp DESC LIMIT 1")

        try:
            async with self.pool.acquire() as con:
                async with con.cursor() as cursor:
                    """
                    There is a bug for this specific query that sometimes the result returns empty although it
                    shouldn't.
                    So as long as the fetch result is None, it will keep trying until actual info from the table will
                    be returned.
                    """
                    fetch = None
                    while fetch is None:
                        await cursor.execute(query)
                        fetch = await cursor.fetchone()

                    return fetch

        except Exception as e:
            print_flush("get_timestamp_gamemode exception: " + str(e))
            return None

    # Count the total occurrences of a game event for a player in a given time frame.
    async def count_total_player_events(self, event, player_id, tstamp, gamemode):
        query = ("SELECT count(Event) FROM " + self.db + "." + self.tb + " WHERE Event = '" + event +
                 "' AND format(Timestamp, 3) > " + str(self.timestamps[player_id - 1]) +
                 " AND format(Timestamp, 3) <= " + str(tstamp) + " AND PlayerID = " + str(player_id) +
                 " AND GameMode = '" + gamemode + "'")

        # If event is pickup - count only items belonging to player.
        if event == "pickup" and gamemode == "Cooperative":
            query += " AND Item = " + str(player_id)
        # If event is spawn - count only item spawns.
        elif event == "spawn":
            query += " AND Enemy = 0"
            # In competitive items are not set for a specific player.
            if gamemode == "Competitive":
                query = query.replace(" AND PlayerID = " + str(player_id), "")
        # In competitive mode failPickup is not related to a specific player.
        # If a treasure disappears before any player picks it up - all the players get failPickup
        elif event == "failPickup" and gamemode == "Competitive":
            query = query.replace(" AND PlayerID = " + str(player_id), "")

        try:
            async with self.pool.acquire() as con:
                async with con.cursor() as cursor:
                    await cursor.execute(query)
                    fetch = await cursor.fetchone()

                    return fetch

        except Exception as e:
            print_flush("count_total_player_events exception: " + str(e))
            return None

    # Insert data to temporary DDA table.
    async def insert_dda_table(self, player_id, penalty, bonus, skill, level, timestamp):
        query = ("INSERT INTO " + self.db + "." + self.DDAtb +
                 "(PlayerID, Penalty, Bonus, Skill, Level, Timestamp) VALUES (" + str(player_id) + ", " + str(penalty) +
                 ", " + str(bonus) + ", " + str(skill) + ", " + str(level) + ", " + str(timestamp) + ")")

        try:
            async with self.pool.acquire() as con:
                async with con.cursor() as cursor:
                    await cursor.execute(query)
                    await con.commit()

                    return True

        except Exception as e:
            print_flush("insert_dda_table exception: " + str(e))
            return False

    # Transfer all the data from the temporary table to a permanent one in the platform's DB.
    async def insert_permanent_table(self, instance_id):
        select_query = ("SELECT PlayerID, Penalty, Bonus, Skill, Level, Timestamp FROM " + self.db + "." + self.DDAtb)
        experiment_query = ("SELECT ExperimentId FROM " + os.getenv('DATABASE_PLATFORM') +
                            ".instances WHERE InstanceId = '" + instance_id + "'")
        insert_vals = []
        insert_query = ("INSERT INTO " + os.getenv('DATABASE_PLATFORM') + ".dda_calculations " +
                        "(ExperimentId, InstanceId, PlayerID, Penalty, Bonus, Skill, Level, Timestamp) VALUES " +
                        "(%s, %s, %s, %s, %s, %s, %s, %s) ON DUPLICATE KEY UPDATE " +
                        "ExperimentId = VALUES(ExperimentId), InstanceId = VALUES(InstanceId), " +
                        "PlayerID = VALUES(PlayerID), Penalty = VALUES(Penalty), Bonus = VALUES(Bonus), " +
                        "Skill = VALUES(Skill), Level = VALUES(Level), Timestamp = VALUES(Timestamp);")

        try:
            async with self.pool.acquire() as con:
                async with con.cursor() as cursor:
                    plat_con = await aiomysql.connect(host=os.getenv('HOST_PLATFORM'),
                                                      db=os.getenv('DATABASE_PLATFORM'),
                                                      port=int(os.getenv('PORT_PLATFORM')),
                                                      password=os.getenv('PASSWORD'),
                                                      user=os.getenv('USER'),
                                                      auth_plugin='mysql_native_password')
                    plat_cur = await plat_con.cursor()

                    await cursor.execute(select_query)
                    select_fetch = await cursor.fetchall()

                    await plat_cur.execute(experiment_query)
                    experiment_fetch = await plat_cur.fetchone()
                    experiment_id = experiment_fetch[0]

                    for result in select_fetch:
                        insert_vals.append((experiment_id, instance_id) + result)

                    await plat_cur.executemany(insert_query, insert_vals)
                    await plat_con.commit()

                    if plat_cur:
                        await plat_cur.close()
                    if plat_con:
                        plat_con.close()

                    return True

        except Exception as e:
            print_flush("insert_permanent exception:" + str(e))
            if plat_cur:
                await plat_cur.close()
            if plat_con:
                plat_con.close()
            return False
