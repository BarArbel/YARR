import mysql.connector
import os
from dotenv import load_dotenv
load_dotenv()
# ----------------------


class DB_connection:

    def __init__(self, table_name):
        self.db = 'yarr_game1'
        self.tb = table_name
        self.DDAtb = "dda_"+table_name
        self.cnx = mysql.connector.connect(user=os.getenv('USER'), password=os.getenv('PASSWORD'),
                                           host=os.getenv('HOST'), database=self.db)
        self.cursor = self.cnx.cursor()
        self.create_DDA_table(self)

    def create_DDA_table(self):
        query = ("CREATE TABLE `" + self.db + "`.`" + self.DDAtb + "` ("
                 "`Index` INT UNSIGNED NOT NULL AUTO_INCREMENT,"
                 "`PlayerID` INT UNSIGNED NOT NULL,"
                 "`Threshold` FLOAT NOT NULL,"
                 "`I_SpawnHeight_level` INT UNSIGNED NOT NULL,"
                 "`I_SpawnHeight_skill` BOOLEAN NOT NULL,"
                 "`I_DestroyTimer_level` INT UNSIGNED NOT NULL,"
                 "`I_DestroyTimer_skill` BOOLEAN NOT NULL,"
                 "`E_Precision_level` INT UNSIGNED NOT NULL,"
                 "`E_Precision_skill` BOOLEAN NOT NULL,"
                 "`E_Speed_level` INT UNSIGNED NOT NULL,"
                 "`E_Speed_skill` BOOLEAN NOT NULL,"
                 "`E_SpawnRate_level` INT UNSIGNED NOT NULL,"
                 "`E_SpawnRate_skill` BOOLEAN NOT NULL,"
                 "PRIMARY KEY (`Index`))"
                 "DEFAULT CHARACTER SET = utf8;")

        self.cursor.execute(query)

    def remove_DDA_table(self):
        query = ("DROP TABLE `" + self.db + "`.`" + self.DDAtb + "`")
        self.cursor.execute(query)

    def close_connection(self):
        self.remove_DDA_table()
        self.cursor.close()
        self.cnx.close()

    def count_total_player_events(self, event, player_id):
        query = ("SELECT count(" + event + ") FROM `" + self.tb +
                 "` WHERE Event = " + event + " AND PlayerID = " + player_id)
        self.cursor.execute(query)

    def count_total_team_events(self, value, event):
        query = ("SELECT count(" + value + ") FROM `" + self.tb +
                 "` WHERE Event = " + event)
        self.cursor.execute(query)

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
                 "VALUES (" + PlayerID + ", " + Threshold + ", " +
                 I_SpawnHeight_level + ", " + I_SpawnHeight_skill + ", " +
                 I_DestroyTimer_level + ", " + I_DestroyTimer_skill + ", " +
                 E_Precision_level + ", " + E_Precision_skill + ", " +
                 E_Speed_level + ", " + E_Speed_skill + ", " +
                 E_SpawnRate_level + ", " + E_SpawnRate_skill + ")")
        self.cursor.execute(query)
