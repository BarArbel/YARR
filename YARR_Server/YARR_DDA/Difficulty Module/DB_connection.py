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

    async def init_extender(self, number_of_players):
        for i in range(number_of_players):
            self.timestamps.append(0)

        self.pool = await aiomysql.create_pool(user=os.getenv('USER'), password=os.getenv('PASSWORD'),
                                               host=os.getenv('HOST_DDA'), db=self.db, port=os.getenv('PORT_DDA'),
                                               auth_plugin='mysql_native_password')

        if await self.check_if_table_exist():
            await self.init_timestamps()
            self.newT_continueF = False
        else:
            await self.create_dda_table()

    async def check_if_table_exist(self):

        async with self.pool.acquire() as con:
            async with con.cursor() as cursor:
                await cursor.execute("SHOW TABLES")
                fetch = await cursor.fetchall()

                for result in fetch:
                    if result[0] == self.DDAtb:
                        return True

                return False

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

    async def get_levels(self, number_of_players):

        query = ("SELECT PlayerID, sum(Level) as sum_lv FROM " + self.db + "." + self.DDAtb + " GROUP BY PlayerID")

        levels = []
        for i in range(number_of_players):
            levels.append(0)

        async with self.pool.acquire() as con:
            async with con.cursor() as cursor:
                await cursor.execute(query)
                fetch = await cursor.fetchall()

                for result in fetch:
                    if result[0] is not None and result[1] is not None:
                        levels[result[0] - 1] = result[1]

        return levels

    async def remove_dda_table(self):
        query = ("DROP TABLE `" + self.db + "`.`" + self.DDAtb + "`")

        async with self.pool.acquire() as con:
            async with con.cursor() as cursor:
                await cursor.execute(query)

    async def close_connection(self):
        await self.remove_dda_table()
        self.pool.close()
        await self.pool.wait_closed()
    
    async def get_timestamp_gamemode(self):
        # query = ("SELECT format(Timestamp, 3) FROM " + self.db + "." + self.tb + " ORDER BY Timestamp DESC LIMIT 1")
        query = ("SELECT format(max(Timestamp), 3), GameMode FROM " + self.db + "." + self.tb)

        try:
            async with self.pool.acquire() as con:
                async with con.cursor() as cursor:
                    await cursor.execute(query)
                    fetch = await cursor.fetchone()
                    return fetch
        except Exception as e:
            print("get_timestamp exception: " + str(e))
            sys.stdout.flush()
            return None

    async def get_gamemode(self, timestamp):
        query = ("SELECT GameMode FROM " + self.db + "." + self.tb + " WHERE format(Timestamp, 3) >= "
                 + str(timestamp) + " ORDER BY Timestamp ASC LIMIT 1")

        try:
            async with self.pool.acquire() as con:
                async with con.cursor() as cursor:
                    await cursor.execute(query)
                    fetch = await cursor.fetchone()
                    return fetch
        except Exception as e:
            print("get_gamemode exception: " + str(e))
            sys.stdout.flush()
            return None

    async def count_last_pickup_events(self, player_id, tstamp, limit):
        try:
            query = ("SELECT count(Event) FROM (select Event from " + self.db + "." + self.tb +
                     " WHERE (Event = 'pickup' OR Event =  'failPickup') AND format(Timestamp, 3) > " +
                     str(self.timestamps[player_id - 1]) + "  AND format(Timestamp, 3) <= " + str(tstamp) +
                     " AND PlayerID = " + str(player_id) + " AND Item = " + str(player_id) +
                     " ORDER BY Timestamp DESC LIMIT " + str(limit) + ") AS limitTable WHERE Event = 'Pickup'")

            async with self.pool.acquire() as con:
                async with con.cursor() as cursor:
                    await cursor.execute(query)
                    fetch = await cursor.fetchone()
                    return fetch
        except Exception as e:
            print("count_last_pickups exception: " + str(e))
            sys.stdout.flush()
            return [-1]

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

    async def insert_permanent_table(self, instance_id):

        select_query = ("SELECT PlayerID, Penalty, Bonus, Skill, Level, Timestamp FROM " + self.db + "." + self.DDAtb)
        experiment_query = ("SELECT ExperimentId FROM " + self.db + ".instances WHERE InstanceId = '" +
                            instance_id + "'")
        insert_vals = []
        insert_query = ("INSERT INTO " + self.db + ".dda_calculations (ExperimentId, InstanceId, PlayerID, Penalty, " +
                        "Bonus, Skill, Level, Timestamp) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)")

        async with self.pool.acquire() as con:
            async with con.cursor() as cursor:
                await cursor.execute(select_query)
                select_fetch = await cursor.fetchall()

                await cursor.execute(experiment_query)
                experiment_fetch = await cursor.fetchone()
                experiment_id = experiment_fetch[0]

                for result in select_fetch:
                    insert_vals.append((experiment_id, instance_id) + result)

                plat_con = await aiomysql.connect(host=os.getenv('HOST_PLATFORM'), user=os.getenv('USER'),
                                                  password=os.getenv('PASSWORD'), db=os.getenv('DATABASE_PLATFORM'),
                                                  port=os.getenv('PORT_PLATFORM'), auth_plugin='mysql_native_password')
                plat_cur = await plat_con.cursor()
                await plat_cur.executemany(insert_query, insert_vals)
                await plat_con.commit()
                await plat_cur.close()
                await plat_con.close()

                # await cursor.executemany(insert_query, insert_vals)
                # await con.commit()
