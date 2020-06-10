import sys
import os
import aiomysql
from dotenv import load_dotenv

load_dotenv()


class DBconnection:

    def __init__(self, table_name):
        self.newT_continueF = True
        self.counter = 0
        self.timestamps = []
        self.db = os.getenv('DATABASE_DDA')
        self.tb = table_name
        self.DDAtb = "dda_"+table_name

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
        if await self.check_if_table_exist():
            await self.init_timestamps()
            self.newT_continueF = False
        else:
            await self.create_dda_table()

    # Checks if the instance's temporary DDA table already exists.
    async def check_if_table_exist(self):

        async with self.pool.acquire() as con:
            async with con.cursor() as cursor:
                await cursor.execute("SHOW TABLES")
                fetch = await cursor.fetchall()

                for result in fetch:
                    if result[0] == self.DDAtb:
                        return True

                return False

    # Sets the timestamp for each player's last level change in case the game instance was interrupted.
    async def init_timestamps(self):

        query = ("SELECT PlayerID, format(max(Timestamp), 3) as max_ts FROM " + self.db + "." + self.DDAtb +
                 " WHERE Level != 0 GROUP BY PlayerID")

        async with self.pool.acquire() as con:
            async with con.cursor() as cursor:
                await cursor.execute(query)
                fetch = await cursor.fetchall()

                for result in fetch:
                    if result[0] is not None and result[1] is not None:
                        self.timestamps[result[0] - 1] = result[1]

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

        async with self.pool.acquire() as con:
            async with con.cursor() as cursor:
                await cursor.execute(query)

    # Calculate the player's level when the game instance was interrupted.
    async def get_levels(self, number_of_players):

        query = ("SELECT PlayerID, Level FROM " + self.db + "." + self.DDAtb + " ORDER BY Timestamp ASC")

        levels = []
        for i in range(number_of_players):
            levels.append(0)

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

    # Delete the temporary DDA table.
    async def remove_dda_table(self):
        query = ("DROP TABLE `" + self.db + "`.`" + self.DDAtb + "`")

        async with self.pool.acquire() as con:
            async with con.cursor() as cursor:
                await cursor.execute(query)

    # Close connection to the DB.
    async def close_connection(self):
        await self.remove_dda_table()
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
            print("get_timestamp exception: " + str(e))
            sys.stdout.flush()
            return None, None

    # Count the total occurrences of a game event for a player.
    async def count_total_player_events(self, event, player_id, tstamp, spawn_item_flag, player_flag, gamemode):

        try:
            query = ("SELECT count(Event) FROM " + self.db + "." + self.tb + " WHERE Event = '" + event +
                     "' AND format(Timestamp, 3) > " + str(self.timestamps[player_id - 1]) +
                     " AND format(Timestamp, 3) <= " + str(tstamp) + " AND PlayerID = " + str(player_id) +
                     " AND GameMode = '" + gamemode + "'")

            if event == "pickup" and gamemode == "Cooperative":
                if player_flag is True:
                    query += (" AND Item = " + str(player_id))
                else:
                    query += (" AND Item != " + str(player_id))
            elif event == "spawn":
                if spawn_item_flag is True:
                    query += " AND Enemy = 0"
                else:
                    query += " AND Item = 0"
                if gamemode == "Competitive":
                    query = query.replace(" AND PlayerID = " + str(player_id), "")

            async with self.pool.acquire() as con:
                async with con.cursor() as cursor:
                    await cursor.execute(query)
                    fetch = await cursor.fetchone()
                    return fetch

        except Exception as e:
            print("count_total exception: " + str(e))
            sys.stdout.flush()
            return [-1]

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
        except Exception as e:
            print("insert_dda exception: " + str(e))
            sys.stdout.flush()

    # Transfer all the data from the temporary table to a permanent one in the platform's DB.
    async def insert_permanent_table(self, instance_id):

        select_query = ("SELECT PlayerID, Penalty, Bonus, Skill, Level, Timestamp FROM " + self.db + "." + self.DDAtb)
        experiment_query = ("SELECT ExperimentId FROM " + os.getenv('DATABASE_PLATFORM') +
                            ".instances WHERE InstanceId = '" + instance_id + "'")
        insert_vals = []
        insert_query = ("INSERT INTO " + os.getenv('DATABASE_PLATFORM') + ".dda_calculations " +
                        "(ExperimentId, InstanceId, PlayerID, Penalty, Bonus, Skill, Level, Timestamp) VALUES " +
                        "(%s, %s, %s, %s, %s, %s, %s, %s)")

        try:
            async with self.pool.acquire() as con:
                async with con.cursor() as cursor:
                    plat_con = await aiomysql.connect(host=os.getenv('HOST_PLATFORM'), db=os.getenv('DATABASE_PLATFORM'),
                                                      port=int(os.getenv('PORT_PLATFORM')), password=os.getenv('PASSWORD'),
                                                      user=os.getenv('USER'), auth_plugin='mysql_native_password')
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

                    await plat_cur.close()
                    await plat_con.close()
        except Exception as e:
            print("insert_permanent exception:" + str(e))
            sys.stdout.flush()
