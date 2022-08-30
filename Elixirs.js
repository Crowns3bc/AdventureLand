setInterval(function()
{
    if(character.slots.elixir == null)
    {
        game_log("Drinking Elixir");
        use(5);
    }
},20*1000);