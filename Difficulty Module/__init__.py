from DB_connection import DB_connection
from difficulty_calc import DDA_calc
import socket
import json
import socketio

first_connection = True
table_name = ""
con = None
number_of_players = 3
host = "localhost"
recv_port = "52300"


def getDataFromDB():

    total = {
        "pickup": [],
        "giveItem": [],
        "revivePlayer": [],
        "temporaryLose": [],
        "revived": [],
        "lose": [],
        "dropItem": [],
        "getDamaged": [],
        "avoidDamage": [],
        "blockDamage": [],
        "failPickup": [],
        "fallAccidently": [],
        "individualLoss": [],
        "spawn": []
    }

    last_skills = {
        "I_SpawnHeight_skill": [],
        "E_Precision_skill": [],
        "E_Speed_skill": []
    }

    for player_id in range(number_of_players):
        for event in total:
            total[event].append(con.count_total_player_events(
                event, player_id + 1))

        for skill in last_skills:
            last_skills[skill].append(con.get_DDA_last_player_skill(
                skill, player_id + 1))

    return total, last_skills


def calculate(total, last_skills):

    calcs = {
        "threshold": 0,
        "spawnHeigthAndTimer": {
            "skill": [],
            "level": []
        },
        "precision": {
            "skill": [],
            "level": []
        },
        "speedAndSpawnRate": {
            "skill": [],
            "level": []
        }
    }

    key_pairs = [
        ["spawnHeigthAndTimer", "I_SpawnHeight_skill"],
        ["precision", "E_Precision_skill"],
        ["speedAndSpawnRate", "E_Speed_skill"]
    ]

    calc = DDA_calc()

    calcs["threshold"] = calc.calc_threshold(total["pickup"], total["spawn"])

    for player_id in range(number_of_players):
        calcs["spawnHeightAndTimer"]["skill"].append(
            calc.calc_spawn_height_and_timer(
                sum(total["pickup"]), total["fallAccidently"][player_id],
                total["failPickup"][player_id], total["pickup"][player_id],
                total["spawn"][player_id]
            )
        )

        calcs["precision"]["skill"].append(
            calc.calc_precision(
                total["avoidDamage"][player_id],
                total["getDamaged"][player_id], total["pickup"][player_id],
                total["spawn"][player_id]
            )
        )

        calcs["speedAndSpawnRate"]["skill"].append(
            calc.calc_speed_and_spawn_rate(
                total["avoidDamage"][player_id],
                total["getDamaged"][player_id],
                total["blockDamage"][player_id], total["pickup"][player_id],
                total["spawn"][player_id]
            )
        )

        for pair in key_pairs:
            rangeMax = last_skills[pair[1]] + calcs["threshold"]
            rangeMin = last_skills[pair[1]] - calcs["threshold"]
            skill = calcs[pair[0]]["skill"][-1]

            calcs[pair[0]]["level"].append(1 if skill > rangeMax else (
                -1 if skill <= rangeMin else 0))

    return calcs


def insertCalculationsToDB(calcs):

    for player_id in range(number_of_players):
        con.insert_DDA_table(player_id + 1, calcs["threshold"],
                             calcs["spawnHeightAndTimer"]["level"][player_id],
                             calcs["spawnHeightAndTimer"]["skill"][player_id],
                             calcs["spawnHeightAndTimer"]["level"][player_id],
                             calcs["spawnHeightAndTimer"]["skill"][player_id],
                             calcs["precision"]["level"][player_id],
                             calcs["precision"]["skill"][player_id],
                             calcs["speedAndSpawnRate"]["level"][player_id],
                             calcs["speedAndSpawnRate"]["skill"][player_id],
                             calcs["speedAndSpawnRate"]["level"][player_id],
                             calcs["speedAndSpawnRate"]["skill"][player_id])
    return


data_collector_socket = socketio.Client()
#game_socket = socketio.Server()


@data_collector_socket.event
def connect():
    print('Connected successfuly to data collector')


@data_collector_socket.on("message")
def on_message(data):
    print('message received with ', data)
    global first_connection, table_name, con
    if first_connection is True:
        table_name = data.split(" ")[1].split(".")[1]
        con = DB_connection(table_name, number_of_players)
        first_connection = False
        print("done first connection")

    elif data == "table yarrserver." + table_name + " updated":
        total, last_skills = getDataFromDB()
        calcs = calculate(total, last_skills)
        insertCalculationsToDB(calcs)

        game_json = {
            "message": "DIFFICULTY_MODULE_VARIABLES",
            "data": calcs
        }
        #game_socket.emit('message', json.dump(game_json))

    elif data == "table yarrserver." + table_name + " finished the game":
        # transfer data from temporary tables to permanent experiment table
        game_json = {
            "message": "EXPERIMENT_END"
        }
        #game_socket.emit('message', json.dump(game_json))
        con.close_connection()
        #server_socket.close()
        #data_collector_socket.close()
        exit(0)
    #sio.emit('my response', {'response': 'my response'})


@data_collector_socket.event
def disconnect():
    print('Disconnected from data collector')
    exit(0)



if __name__ == '__main__':

    
    send_port = 3005
    buff_size = 1024
    listen_queue = 1
    msg = ""
    tablename = ""

    connected_to_data_collector = False
    connected_to_game = False

    while not connected_to_data_collector:
        try:
            data_collector_socket.connect("http://" + host + ":" + recv_port)
        except:
            print("Failed to connect to data collector, trying again")
        else:
            print("Connected successfuly to data collector")
            connected_to_data_collector = True

    data_collector_socket.wait()

    """server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind((socket.gethostname(), send_port))
    server_socket.listen(listen_queue)

    while not connected_to_game:
        try:
            game_socket, address = server_socket.accept()
        except:
            print("Failed to connect to game, trying again")
        else:
            connected_to_game = True
            print("Connected successfuly to game")"""

    """print("before recv")
    msg = data_collector_socket.recv(buff_size)
    print("after recv")
    table_name = msg.decode("utf-8")
    print("table_name '" + table_name + "'")
    print("msg '" + msg + "'")"""
    #con = DB_connection("game_snapshot", number_of_players)
    """con = DB_connection(table_name, number_of_players)
    con.create_DDA_table()

    while True:
        msg = data_collector_socket.recv(buff_size)
        decoded_msg = msg.decode("utf-8")

        if decoded_msg == "DATA_COLLECTOR_PING":
            total, last_skills = getDataFromDB(con, number_of_players)
            calcs = calculate(number_of_players, total, last_skills)
            insertCalculationsToDB(con, number_of_players, calcs)

            game_json = {
                "message": "DIFFICULTY_MODULE_VARIABLES",
                "data": calcs
            }
            game_socket.send(json.dump(game_json))

        elif decoded_msg == "EXPERIMENT_END":
            # transfer data from temporary tables to permanent experiment table
            game_json = {
                "message": "EXPERIMENT_END"
            }
            game_socket.send(json.dump(game_json))
            server_socket.close()
            data_collector_socket.close()
            con.close_connection()
            exit(0)"""
