from DB_connection import DB_connection
from difficulty_calc import DDA_calc
import socketio
import asyncio
import time
import os
import sys
from dotenv import load_dotenv

load_dotenv()
number_of_players = 3
starting_level = 2
last_time = None
sio = socketio.AsyncClient()
# first_connection = True
instance_id = ""
table_name = "DDA_Input_"
con = None
calc = None
host = os.getenv('HOST_SERVER')
recv_port = os.getenv('PORT_SERVER')


async def getDataFromDB():
    global con, number_of_players

    total = {
        "pickupPlayerLimit": [],
        "pickupPlayerTotal": [],
        "pickupOther": [],
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
        "spawnPlayerItem": [],
        "spawnEnemy": []
    }

    fetch = await con.get_timestamp()
    timestamp = fetch[0]

    for player_id in range(number_of_players):
        for event in total:
            tempEvent = event
            tempSpawnItemFlag = False
            tempPlayerFlag = True

            if event == "pickupPlayerLimit":
                fetch = await con.count_last_pickup_events(player_id + 1,
                                                           timestamp, 5)
            else:
                if event == "pickupPlayerTotal" or event == "pickupOther":
                    tempEvent = "pickup"
                    if event == "pickupOther":
                        tempPlayerFlag = False
                elif event == "spawnPlayerItem" or event == "spawnEnemy":
                    tempEvent = "spawn"
                    if event == "spawnPlayerItem":
                        tempSpawnItemFlag = True

                fetch = await con.count_total_player_events(tempEvent,
                                                            player_id + 1,
                                                            timestamp,
                                                            tempSpawnItemFlag,
                                                            tempPlayerFlag)

            total[event].append(fetch[0])

    return total, timestamp


def calculate(total, timestamp):
    global con, calc, number_of_players

    calcs = {
        "penalty": [],
        "bonus": [],
        "skill": [],
        "level": []
    }

    for player_id in range(number_of_players):

        penalty, bonus = calc.calc_penalty_and_bonus(
            total["pickupPlayerTotal"][player_id],
            total["giveItem"][player_id], total["revivePlayer"][player_id],
            total["getDamaged"][player_id], total["blockDamage"][player_id],
            total["fallAccidently"][player_id])
        calcs["penalty"].append(penalty)
        calcs["bonus"].append(bonus)

        skill = calc.calc_skill(penalty, bonus,
                                total["pickupPlayerTotal"][player_id],
                                total["spawnPlayerItem"][player_id])
        if skill is None:
            calcs["skill"].append(-1)
            calcs["level"].append(0)
            continue
        calcs["skill"].append(skill)

        level = calc.calc_difficulty(skill)
        calcs["level"].append(level)

        player_level = calc.player_levels[player_id]
        if level != 0 and player_level > 1 and player_level < 6:
            calc.player_levels[player_id] += level
            con.timestamps[player_id] = timestamp

    return calcs


async def insertCalculationsToDB(calcs, timestamp):
    global con, number_of_players

    for player_id in range(number_of_players):
        await con.insert_DDA_table(player_id + 1,
                                   calcs["penalty"][player_id],
                                   calcs["bonus"][player_id],
                                   calcs["skill"][player_id],
                                   calcs["level"][player_id],
                                   timestamp)


def createGameJson(calcs):
    global con, number_of_players

    game_json = {
        "index": 0,
        "LevelSpawnHeightAndTimer": [],
        "LevelPrecision": [],
        "LevelSpeedAndSpawnRate": []
    }

    game_json["index"] = con.counter
    con.counter = con.counter + 1

    for player_id in range(number_of_players):
        game_json["LevelSpawnHeightAndTimer"].append(calcs["level"][player_id])

        game_json["LevelPrecision"].append(calcs["level"][player_id])

        game_json["LevelSpeedAndSpawnRate"].append(calcs["level"][player_id])

    return game_json


@sio.event
def connect():
    print('Connected successfuly to data collector')


@sio.on("DDAinput")
async def on_message(data):
    # global first_connection, table_name, con, last_time, starting_level
    global instance_id, table_name, last_time, starting_level

    print('message received with ', data)

    if data == instance_id:
        current_time = time.time()
        if current_time > last_time + 5:
            last_time = current_time
            total, timestamp = await getDataFromDB()
            calcs = calculate(total, timestamp)
            await insertCalculationsToDB(calcs, timestamp)
            game_json = createGameJson(calcs)

            emit_json = {
                "LvSettings": game_json,
                "instanceId": instance_id
            }

            await sio.emit('LevelSettings', emit_json)
            print("data sent to server: ", emit_json)

    """if first_connection is True:
        tmp_table_name = data.split(" ")[1].split(".")[1]
        if not tmp_table_name.startswith("DDA") and not tmp_table_name.startswith("dda"):
            return
        else:
            table_name = tmp_table_name
            con = DB_connection(table_name)
            await con._init(number_of_players)
            last_time = time.time()
            first_connection = False
            print("done first connection")

    elif data == "table yarrserver." + table_name + " updated":
        current_time = time.time()
        if current_time > last_time + 5:
            last_time = current_time
            total, timestamp = await getDataFromDB()
            calcs = calculate(total, timestamp)
            await insertCalculationsToDB(calcs, timestamp)
            game_json = createGameJson(calcs)
            await sio.emit('variables', game_json)
            print("variables sent to game: ", game_json)

    elif data == "table yarrserver." + table_name + " finished the game":
        # transfer data from temporary tables to permanent experiment table

        await sio.emit('end', 'experiment ended')
        await con.close_connection()
        await sio.disconnect()"""


@sio.on("gameEnded")
async def on_gameended(data):
    global instance_id, con

    if data == instance_id:
        await con.insert_permanent_table(instance_id)
        await con.close_connection()
        await sio.disconnect()


@sio.event
def disconnect():
    print('Disconnected from data collector')


async def init_vars(args):
    global instance_id, table_name, con, calc, number_of_players, last_time
    global starting_level

    instance_id = args[0]
    starting_level = int(args[1])
    number_of_players = int(args[2])

    table_name += instance_id
    con = DB_connection(table_name)
    await con._init(number_of_players)
    if con.newT_continueF:
        levels = await con.get_levels(number_of_players)
    else:
        levels = []
    calc = DDA_calc(number_of_players, starting_level, levels)
    last_time = time.time()
    print("done init_vars")


async def start_server(args):
    global host, recv_port

    connected_to_server = False

    await init_vars(args)

    while not connected_to_server:
        try:
            await sio.connect("http://" + host + ":" + recv_port)
        except:
            print("Failed to connect to data collector, trying again")
        else:
            connected_to_server = True

    await sio.wait()


if __name__ == '__main__':
    print("hello ", sys.argv)
    sys.stdout.flush()
    loop = asyncio.get_event_loop()
    loop.run_until_complete(start_server(sys.argv[1:]))
    loop.close()
