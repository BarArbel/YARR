import mysql.connector

#----------------------
class DB_connection:
    
    def __init__(self, table_name):
        self.db = 'yarr_game1'
        self.tb = table_name
        self.DDAtb = "dda_"+table_name
        self.cnx = mysql.connector.connect(user='root', password='123456',
                                           host='localhost',
                                           database= self.db)
        self.cursor = self.cnx.cursor()
        
    
    def create_DDA_table (self):
        query = ("CREATE TABLE `"+self.db +"`.`"+self.DDAtb+"` ("
      "`Index` INT UNSIGNED NOT NULL AUTO_INCREMENT,"
      "`Threshold` FLOAT NOT NULL,"
      "`I_SpawnHeight` BOOLEAN NOT NULL,"
      "`I_DestroyTimer` BOOLEAN NOT NULL,"
      "`E_Precision` BOOLEAN NOT NULL,"
      "`E_Speed` BOOLEAN NOT NULL,"
      "`E_SpawnRate` BOOLEAN NOT NULL,"
      "PRIMARY KEY (`Index`))"
       "DEFAULT CHARACTER SET = utf8;")
            
        self.cursor.execute(query)
        
    def remove_DDA_table(self):
        query = ("DROP TABLE `"+self.db+"`.`"+self.DDAtb+"`")
        self.cursor.execute(query)
        
    def close_connection (self):
        remove_DDA_table(self)
        self.cursor.close()
        self.cnx.close()
            
    
    def count_total_player_events( self, event, player_id ):
        query = ("SELECT count("+event+") FROM `"+self.tb+"` WHERE Event = "+event+" AND PlayerID = "+player_id)
        self.cursor.execute(query)
        
    def count_total_team_events( self, value, event ):
        query = ("SELECT count("+value+") FROM `"+self.tb+"` WHERE Event = "+event)
        self.cursor.execute(query)    

#----------------------
con = DB_connection("game_snapshot")  
con.create_DDA_table()
  
for row in con.cursor:
    print(row)

