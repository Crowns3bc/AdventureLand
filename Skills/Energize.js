setInterval(function(){
    var c1 = get_player("CrownSpam");
    if(c1.mp < 1600 && character.mp > (character.max_mp * 0.7)){
        use_skill("energize", 'CrownSpam');
    }
}, 300);
