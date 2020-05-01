
# ----------------------


class DDA_calc:

    def __init__(self):
        self.coeff_player_pickup_item_ = 0.7
        self.coeff_spawn_height_and_timer = 0.3
        self.coeff_precision = 0.3
        self.coeff_speed_and_spawn_rate = 0.3
    
    def calc_thresholds(self, player_pickup_item, player_spawn_item):
        if player_spawn_item < 3:
            return None
        else:
            return player_pickup_item / player_spawn_item
    
    def calc_penalty(self, player_pickup_item,  player_pickup_item_fail,
                     player_get_damage, player_block_damage):

        # failed_pickup_penalty = (0.05 * player_pickup_item) * player_pickup_item_fail
        damage_taken_penalty = (0.2 * player_pickup_item) * player_get_damage
        # damage_blocked_penalty = (0.2 * player_pickup_item) * player_block_damage
        # powerup_penalty = 0
        # penalty = failed_pickup_penalty + damage_taken_penalty #- damage_blocked_penalty
        penalty = damage_taken_penalty
        return int(round(penalty))
    
    def calc_skill(self, penalty, player_pickup_item, player_spawn_item):
        if player_spawn_item == 0:
            return None
        else:
            print("pickup: ", player_pickup_item, ", spawn: ", player_spawn_item)
            skill = player_pickup_item - penalty
            print("skill - penalty: ", skill)
            skill = skill / player_spawn_item
            print("skill / spawn: ", skill)
            skill = float(skill * 100.0)
            print("skill * 100: ", skill)
            return skill
    
    def calc_difficulty(self, skill, last_skill, threshold):
        rangeMax = 75
        rangeMin = 25

        return 1 if skill > rangeMax else (-1 if skill <= rangeMin else 0)

    # Avg pickup success rate
    def calc_threshold(self, player_pickup_item, player_spawn_item):
        pickup_success_rate = 0
        player_count = len(player_pickup_item)
        for i in range(player_count):
            pickup = player_pickup_item[i]
            spawn = player_spawn_item[i]
            if spawn != 0:
                pickup_success_rate += pickup / spawn
            else:
                pickup_success_rate += pickup / 0.001
        """for i in player_pickup_item:
            for j in player_spawn_item:
                if j == 0:
                    # pickup_success_rate += i / 0.001
                    continue
                else:
                    pickup_success_rate += i/j"""
        #########
        if self.coeff_player_pickup_item_ > 0.7:            
            self.coeff_player_pickup_item_ -= 0.05
            
        if self.coeff_spawn_height_and_timer < 0.3:  
            self.coeff_spawn_height_and_timer += 0.01
            self.coeff_precision += 0.01
            self.coeff_speed_and_spawn_rate += 0.01
        #########    
        print(self.coeff_player_pickup_item_,self.coeff_spawn_height_and_timer)    
        return pickup_success_rate / player_count

    def calc_spawn_height_and_timer(self, total_pickup_item, player_fall,
                                    player_pickup_item_fail,
                                    player_pickup_item, player_spawn_item):

        if player_spawn_item == 0:
            return 3

        abs_skill = abs((self.coeff_player_pickup_item_ * player_pickup_item) +
                        (self.coeff_spawn_height_and_timer *
                         (total_pickup_item - (player_fall / 2) -
                          (player_pickup_item_fail / 3))))
        rel_skill = abs_skill / player_spawn_item
        return rel_skill

    def calc_precision(self, player_avoid_damage,
                       player_get_damage, player_pickup_item,
                       player_spawn_item):

        if player_spawn_item == 0:
            return 2

        abs_skill = abs((self.coeff_player_pickup_item_ * player_pickup_item) +
                        (self.coeff_spawn_height_and_timer *
                         (player_avoid_damage - player_get_damage)))
        rel_skill = abs_skill / player_spawn_item
        return rel_skill

    def calc_speed_and_spawn_rate(self, player_avoid_damage, player_get_damage,
                                  player_block_damage, player_pickup_item,
                                  player_spawn_item):

        if player_spawn_item == 0:
            return 2

        abs_skill = abs((self.coeff_player_pickup_item_ * player_pickup_item) +
                        (self.coeff_spawn_height_and_timer *
                         (player_block_damage + (player_avoid_damage / 3) -
                          player_get_damage)))
        rel_skill = abs_skill / player_spawn_item
        return rel_skill
