import mysql.connector
import os
from dotenv import load_dotenv
load_dotenv()
# ----------------------


class DB_connection:

    def __init__(self, table_name, number_of_players):
        self.db = os.getenv('DATABASE')
        self.tb = table_name
        self.DDAtb = "dda_"+table_name
        self.cnx = mysql.connector.connect(user=os.getenv('USER'),
                                           password=os.getenv('PASSWORD'),
                                           host=os.getenv('HOST'),
                                           database=self.db,
                                           auth_plugin='mysql_native_password')
        self.cursor = self.cnx.cursor()
        self.create_DDA_table()
        self.initialize_DDA_table(number_of_players)

    def create_DDA_table(self):
        query = ("CREATE TABLE `" + self.db + "`.`" + self.DDAtb + "` ("
                 "`Index` INT UNSIGNED NOT NULL AUTO_INCREMENT,"
                 "`PlayerID` INT UNSIGNED NOT NULL,"
                 "`Threshold` FLOAT NOT NULL,"
                 "`I_SpawnHeight_level` INT NOT NULL,"
                 "`I_SpawnHeight_skill` FLOAT NOT NULL,"
                 "`I_DestroyTimer_level` INT NOT NULL,"
                 "`I_DestroyTimer_skill` FLOAT NOT NULL,"
                 "`E_Precision_level` INT NOT NULL,"
                 "`E_Precision_skill` FLOAT NOT NULL,"
                 "`E_Speed_level` INT NOT NULL,"
                 "`E_Speed_skill` FLOAT NOT NULL,"
                 "`E_SpawnRate_level` INT NOT NULL,"
                 "`E_SpawnRate_skill` FLOAT NOT NULL,"
                 "PRIMARY KEY (`Index`))"
                 "DEFAULT CHARACTER SET = utf8;")

        self.cursor.execute(query)

    def initialize_DDA_table(self, number_of_players):

        initial_SpawnHeight_skill = "3"
        initial_DestroyTimer_skill = "3"
        initial_Precision_skill = "2"
        initial_Speed_skill = "2"
        initial_SpawnRate_skill = "2"

        for i in range(number_of_players):
            query = ("INSERT INTO `" + self.db + "`.`" + self.DDAtb + "` (" +
                     "PlayerID, Threshold, I_SpawnHeight_level, " +
                     "I_SpawnHeight_skill, I_DestroyTimer_level, " +
                     "I_DestroyTimer_skill, E_Precision_level, " +
                     "E_Precision_skill, E_Speed_level, E_Speed_skill, " +
                     "E_SpawnRate_level, E_SpawnRate_skill)" +
                     "VALUES (" + str(i + 1) + ", 0, 0, " +
                     initial_SpawnHeight_skill + ", 0, " +
                     initial_DestroyTimer_skill + ", 0, " +
                     initial_Precision_skill + ", 0, " + initial_Speed_skill +
                     ", 0, " + initial_SpawnRate_skill + ")")

            self.cursor.execute(query)
            self.cnx.commit()

    def get_DDA_last_player_skill(self, skill, player_id):
        query = ("SELECT " + skill + " WHERE PlayerID = " + str(player_id) +
                 "FROM `" + self.db + "`.`" + self.DDAtb +
                 "` ORDER BY Index ASC LIMIT 1")
        self.cursor.execute(query)
        return self.cursor.fetchone()

    def remove_DDA_table(self):
        query = ("DROP TABLE `" + self.db + "`.`" + self.DDAtb + "`")
        self.cursor.execute(query)

    def close_connection(self):
        self.remove_DDA_table()
        self.cursor.close()
        self.cnx.close()

    def count_total_player_events(self, event, player_id):
        try:
            query = ("SELECT count(Event) FROM `" + self.tb +
                     "` WHERE Event = " + event + " AND PlayerID = " +
                     str(player_id))
            self.cursor.execute(query)
            print(self.cursor.fetchall())
            return self.cursor.fetchall()
        except:
            return 0

    def count_total_team_events(self, value, event):
        query = ("SELECT count(" + value + ") FROM `" + self.tb +
                 "` WHERE Event = " + event)
        self.cursor.execute(query)
        return self.cursor.fetchall()

    def insert_DDA_table(self, PlayerID, Threshold, I_SpawnHeight_level,
                         I_SpawnHeight_skill, I_DestroyTimer_level,
                         I_DestroyTimer_skill, E_Precision_level,
                         E_Precision_skill, E_Speed_level, E_Speed_skill,
                         E_SpawnRate_level, E_SpawnRate_skill):

        query = ("INSERT INTO `" + self.db + "`.`" + self.DDAtb + "` (" +
                 "PlayerID, Threshold, I_SpawnHeight_level, " +
                 "I_SpawnHeight_skill, I_DestroyTimer_level, " +
                 "I_DestroyTimer_skill, E_Precision_level, " +
                 "E_Precision_skill, E_Speed_level, E_Speed_skill, " +
                 "E_SpawnRate_level, E_SpawnRate_skill)" +
                 "VALUES (" + str(PlayerID) + ", " + str(Threshold) + ", " +
                 str(I_SpawnHeight_level) + ", " + str(I_SpawnHeight_skill) +
                 ", " + str(I_DestroyTimer_level) + ", " +
                 str(I_DestroyTimer_skill) + ", " + str(E_Precision_level) +
                 ", " + str(E_Precision_skill) + ", " + str(E_Speed_level) +
                 ", " + str(E_Speed_skill) + ", " + str(E_SpawnRate_level) +
                 ", " + str(E_SpawnRate_skill) + ")")

        self.cursor.execute(query)
        self.cnx.commit()
