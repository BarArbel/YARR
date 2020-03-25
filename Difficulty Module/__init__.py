import DB_connection
import difficulty_calc

if __name__ == '__main__':
    con = DB_connection("game_snapshot")  
    con.create_DDA_table()
    
    for row in con.cursor:
        print(row)
