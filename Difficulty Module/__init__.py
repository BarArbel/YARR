from DB_connection import DB_connection
from difficulty_calc import DDA_calc
import socket
import json


def getDataFromDB(con, number_of_players):

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
            lastSkills[skill].append(con.get_DDA_last_player_skill(
                skill, player_id + 1))

    return total, last_skills


def calculate(number_of_players, total, last_skills):

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


def insertCalculationsToDB(con, number_of_players, calcs):

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


if __name__ == '__main__':

    number_of_players = 3
    recv_port = 3004
    send_port = 3005
    buff_size = 1024
    listen_queue = 1

    connected_to_data_collector = False
    connected_to_game = False

    con = DB_connection("game_snapshot", number_of_players)
    con.create_DDA_table()

    data_collector_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    while not connected_to_data_collector:
        try:
            data_collector_socket.connect((socket.gethostname(), recv_port))
        except:
            print("Failed to connect to data collector, trying again")
        else:
            connected_to_data_collector = True
            print("Connected successfuly to data collector")

    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.bind((socket.gethostname(), send_port))
    server_socket.listen(listen_queue)

    while not connected_to_game:
        try:
            game_socket, address = server_socket.accept()
        except:
            print("Failed to connect to game, trying again")
        else:
            connected_to_game = True
            print("Connected successfuly to game")

    while True:
        msg = data_collector_socket.recv(buff_size)
        decoded_msg = msg.decode("utf-8")

        if decoded_msg == "DATA_COLLECTOR_PING":
            total, lastSkills = getDataFromDB(con, number_of_players)
            calcs = calculate(number_of_players, total, lastSkills)
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
            exit(0)
