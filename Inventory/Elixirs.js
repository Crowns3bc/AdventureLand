setInterval(function(){
    if(character.slots.elixir == null){
        game_log("Drinking Elixir");
        use(5); //location of elixir in your inventory
    }
},20*1000);
