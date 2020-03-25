
# Avg pickup success rate
def calc_threshold(player_pickup_item, player_spawn_item):
    pickup_success_rate = 0
    player_count = len(player_pickup_item)
    for i in player_pickup_item:
        for j in player_spawn_item:
            pickup_success_rate += i/j
            
    return pickup_success_rate/ player_count       

def calc_spawn_height_and_timer(total_pickup_item, player_fall, player_pickup_item_fail, player_pickup_item, player_spawn_item):
    print("boop")