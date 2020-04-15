from DB_connection import DB_connection
from difficulty_calc import DDA_calc
import socketio
import asyncio
import time
import os
from dotenv import load_dotenv

load_dotenv()
last_time = time.time()
sio = socketio.AsyncClient()
first_connection = True
table_name = ""
con = None
calc = DDA_calc()
number_of_players = 3
host = os.getenv('HOST')
recv_port = os.getenv('PORT')


async def getDataFromDB():

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
            fetch = await con.count_total_player_events(event,
                                                        player_id + 1)
            total[event].append(fetch[0])

        for skill in last_skills:
            fetch = await con.get_DDA_last_player_skill(skill,
                                                        player_id + 1)
            last_skills[skill].append(fetch[0])

    return total, last_skills


async def calculate(total, last_skills):

    calcs = {
        "threshold": 0,
        "spawnHeightAndTimer": {
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
        ["spawnHeightAndTimer", "I_SpawnHeight_skill"],
        ["precision", "E_Precision_skill"],
        ["speedAndSpawnRate", "E_Speed_skill"]
    ]

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
            rangeMax = last_skills[pair[1]][player_id] + calcs["threshold"]
            rangeMin = last_skills[pair[1]][player_id] - calcs["threshold"]
            skill = calcs[pair[0]]["skill"][-1]

            calcs[pair[0]]["level"].append(1 if skill > rangeMax else (
                -1 if skill <= rangeMin else 0))

    return calcs


async def insertCalculationsToDB(calcs):

    for player_id in range(number_of_players):
        await con.insert_DDA_table(player_id + 1, calcs["threshold"],
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


async def createGameJson(calcs):
    game_json = {
        "index": 0,
        "LevelSpawnHeightAndTimer": [],
        "LevelPrecision": [],
        "LevelSpeedAndSpawnRate": []
    }

    game_json["index"] = con.counter
    con.counter = con.counter + 1

    for player_id in range(number_of_players):
        game_json["LevelSpawnHeightAndTimer"].append(
            calcs["spawnHeightAndTimer"]["level"][player_id])

        game_json["LevelPrecision"].append(
            calcs["precision"]["level"][player_id])

        game_json["LevelSpeedAndSpawnRate"].append(
            calcs["speedAndSpawnRate"]["level"][player_id])

    return game_json


@sio.event
def connect():
    print('Connected successfuly to data collector')


@sio.on("message")
async def on_message(data):
    print('message received with ', data)
    global first_connection, table_name, con, last_time
    if first_connection is True:
        tmp_table_name = data.split(" ")[1].split(".")[1]
        if not tmp_table_name.startswith("DDA") and not tmp_table_name.startswith("dda"):
            return
        else:
            table_name = tmp_table_name
            con = DB_connection(table_name)
            await con._init(number_of_players)
            first_connection = False
            print("done first connection")

    elif data == "table yarrserver." + table_name + " updated":
        # total, last_skills = await getDataFromDB()
        current_time = time.time()
        if current_time > last_time + 5:
            last_time = current_time
            total, last_skills = await getDataFromDB()
            #####
            """shouldUpdate = False
                for player_id in range(number_of_players):
                print(total["pickup"][0])
                print(total["getDamaged"][0])
                if total["pickup"][player_id] != 0 or total["getDamaged"][player_id] != 0:
                    #print(total["pickup"][0])
                    #print(total["getDamaged"][0])
                    shouldUpdate = True

            if shouldUpdate == True:"""
            #####
            calcs = await calculate(total, last_skills)
            await insertCalculationsToDB(calcs)
            game_json = await createGameJson(calcs)
            await sio.emit('variables', game_json)
            print("variables sent to game: ", game_json)

    elif data == "table yarrserver." + table_name + " finished the game":
        # transfer data from temporary tables to permanent experiment table

        await sio.emit('end', 'experiment ended')
        await con.close_connection()
        await sio.disconnect()


@sio.event
def disconnect():
    print('Disconnected from data collector')


async def start_server():
    connected_to_data_collector = False

    while not connected_to_data_collector:
        try:
            await sio.connect("http://" + host + ":" + recv_port)
        except:
            print("Failed to connect to data collector, trying again")
        else:
            connected_to_data_collector = True
    await sio.wait()

if __name__ == '__main__':

    loop = asyncio.get_event_loop()
    loop.run_until_complete(start_server())
    loop.close()
