import mysql.connector
import os
import aiomysql
from dotenv import load_dotenv
load_dotenv()
# ----------------------


class DB_connection:

    def __init__(self, table_name):
        self.counter = 0
        self.timestamps = [0, 0, 0]
        self.db = os.getenv('DATABASE_GAME_DB')
        self.tb = table_name
        self.DDAtb = "dda_"+table_name

    async def _init(self, number_of_players):
        self.pool = await aiomysql.create_pool(user=os.getenv('USER_GAME_DB'),
                                               password=os.getenv('PASSWORD_GAME_DB'),
                                               host=os.getenv('HOST_GAME_DB'),
                                               db=self.db,
                                               auth_plugin='mysql_native_password')
        await self.create_DDA_table()

    async def create_DDA_table(self):

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

    async def remove_DDA_table(self):
        query = ("DROP TABLE `" + self.db + "`.`" + self.DDAtb + "`")

        async with self.pool.acquire() as con:
            async with con.cursor() as cursor:
                await cursor.execute(query)

    async def close_connection(self):
        await self.remove_DDA_table()
        self.pool.close()
        await self.pool.wait_closed()
    
    async def get_timestamp(self):
        query = ("SELECT Timestamp From " + self.db + "." + self.tb +
                 " ORDER BY Timestamp DESC LIMIT 1")
        
        async with self.pool.acquire() as con:
            async with con.cursor() as cursor:
                await cursor.execute(query)
                fetch = await cursor.fetchone()
                return fetch

    async def count_last_pickup_events(self, player_id, tstamp, limit):
        try:
            query = ("SELECT count(Event) FROM (select Event from " + self.db +
                     "." + self.tb + " WHERE (Event = 'pickup' OR Event = " +
                     "'failPickup') AND Timestamp > " +
                     str(self.timestamps[player_id - 1]) +
                     "  AND Timestamp <= " + str(tstamp) + " AND PlayerID = " +
                     str(player_id) + " AND Item = " + str(player_id) +
                     " ORDER BY Timestamp DESC LIMIT " + str(limit) +
                     ") AS limitTable WHERE Event = 'Pickup'")

            async with self.pool.acquire() as con:
                async with con.cursor() as cursor:
                    await cursor.execute(query)
                    fetch = await cursor.fetchone()
                    return fetch
        except Exception as e:
            print("count_last_pickups exception: " + str(e))
            return [-1]

    async def count_total_player_events(self, event, player_id, tstamp,
                                        spawnItemFlag, playerFlag):

        try:
            query = ("SELECT count(Event) FROM " + self.db + "." + self.tb +
                     " WHERE Event = '" + event + "' AND Timestamp > " +
                     str(self.timestamps[player_id - 1]) +
                     " AND Timestamp <= " + str(tstamp) + " AND PlayerID = " +
                     str(player_id))

            if event == "pickup":
                if playerFlag is True:
                    query += (" AND Item = " + str(player_id))
                else:
                    query += (" AND Item != " + str(player_id))
            elif event == "spawn":
                if spawnItemFlag is True:
                    query += (" AND Enemy = 0")
                else:
                    query += (" AND Item = 0")

            async with self.pool.acquire() as con:
                async with con.cursor() as cursor:
                    await cursor.execute(query)
                    fetch = await cursor.fetchone()
                    return fetch

        except Exception as e:
            print("count_total exception: " + str(e))
            return [-1]

    async def insert_DDA_table(self, player_id, penalty, bonus, skill, level,
                               timestamp):

        query = ("INSERT INTO " + self.db + "." + self.DDAtb +
                 "(PlayerID, Penalty, Bonus, Skill, Level, Timestamp) VALUES" +
                 " (" + str(player_id) + ", " + str(penalty) + ", " +
                 str(bonus) + ", " + str(skill) + ", " + str(level) + ", " +
                 str(timestamp) + ")")

        async with self.pool.acquire() as con:
            async with con.cursor() as cursor:
                await cursor.execute(query)
                await con.commit()

    async def insert_permanent_table(self, instance_id):

        select_query = ("SELECT * FROM " + self.db + "." + self.DDAtb)
        select_fetch = None
        experiment_query = ("SELECT ExperimentId FROM " + self.db +
                            ".instances WHERE InstanceId = " + instance_id)
        experiment_fetch = None
        experiment_id = None
        insert_vals = []
        insert_query = ("INSERT INTO " + self.db + ".dda_calculations " +
                        "(ExperimentId, InstanceId, Timestamp, PlayerID, " +
                        "Penalty, Bonus, Skill, Level) VALUES (%d, %s, %f, " +
                        "%d, %f, %f, %f, %d)")

        async with self.pool.acquire() as con:
            async with con.cursor() as cursor:
                await cursor.execute(select_query)
                select_fetch = await cursor.fetchall()

                await cursor.execute(experiment_query)
                experiment_fetch = await cursor.fetchone()
                experiment_id = experiment_fetch[0]

                for result in select_fetch:
                    insert_vals.append((experiment_id, instance_id) + result)

                await cursor.execute(insert_query, insert_vals)
                await con.commit()
