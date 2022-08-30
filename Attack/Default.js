function kill_mobs() {
	let target; 
	target = get_nearest_monster();
	 if(!parent.is_disabled(character) &&
		is_in_range(target) &&
		!is_on_cooldown("attack")){
			 attack(target);
	}
}
