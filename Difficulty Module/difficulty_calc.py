
# ----------------------


class DDA_calc:

    def __init__(self, number_of_players, starting_level):
        self.player_levels = []
        for i in range(number_of_players):
            self.player_levels.append(starting_level)
        """self.coeff_player_pickup_item_ = 0.7
        self.coeff_spawn_height_and_timer = 0.3
        self.coeff_precision = 0.3
        self.coeff_speed_and_spawn_rate = 0.3"""

    """def calc_thresholds(self, player_pickup_item, player_spawn_item):
        if player_spawn_item < 3:
            return None
        else:
            return player_pickup_item / player_spawn_item"""

    def calc_penalty_and_bonus(self, pickup_player_total, give_item,
                               revive_player, get_damaged, block_damage,
                               fall_accidently):

        get_damaged_penalty = (0.4 * pickup_player_total) * get_damaged
        print("get_damaged_penalty: ", get_damaged_penalty)
        fall_accidently_penalty = (0.01 * pickup_player_total) * fall_accidently
        #print("fall_accidently_penalty: ", fall_accidently_penalty)
        penalty = get_damaged_penalty #+ fall_accidently_penalty

        give_item_bonus = (0.2 * pickup_player_total) * give_item
        print("give_item_bonus: ", give_item_bonus)
        revive_player_bonus = (0.2 * pickup_player_total) * revive_player
        print("revive_player_bonus: ", revive_player_bonus)
        block_damage_bonus = (0.01 * pickup_player_total) * block_damage
        print("block_damage_bonus: ", block_damage_bonus)
        bonus = give_item_bonus + revive_player_bonus + block_damage_bonus

        return round(penalty, 3), round(bonus, 3)

    def calc_skill(self, penalty, bonus, pickup_player_total, spawn_player_item):
        if spawn_player_item < 3:
            return None
        else:
            print("pickup: ", pickup_player_total, ", spawn: ", spawn_player_item)
            print("penalty: ", penalty, ", bonus: ", bonus)
            #skill = pickup_player_total - penalty + bonus
            #skill = skill / spawn_player_item
            skill = round(pickup_player_total / spawn_player_item, 3)
            print("start skill: ", skill)
            skill = float(skill * 100.0)
            print("skill * 100: ", skill)
            skill = skill - penalty + bonus
            print("final skill: ", skill)
            return skill

    def calc_difficulty(self, skill):
        rangeMax = 66
        rangeMin = 33

        return 1 if skill > rangeMax else (-1 if skill <= rangeMin else 0)

    # Avg pickup success rate
    """def calc_threshold(self, player_pickup_item, player_spawn_item):
        pickup_success_rate = 0
        player_count = len(player_pickup_item)
        for i in range(player_count):
            pickup = player_pickup_item[i]
            spawn = player_spawn_item[i]
            if spawn != 0:
                pickup_success_rate += pickup / spawn
            else:
                pickup_success_rate += pickup / 0.001
        #for i in player_pickup_item:
            #for j in player_spawn_item:
                #if j == 0:
                    # pickup_success_rate += i / 0.001
                    #continue
                #else:
                    #pickup_success_rate += i/j
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
        return rel_skill"""
