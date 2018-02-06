var socket = io({transports: ['websocket'], upgrade: false});
console.log("started");

//for the game (like players in game)
var storeData;
var seeData;
var gameData;
var roomId; 
var gameStarted = false;
var ownUsername = "";
//window resize, repaint the users
window.addEventListener('resize', function(){
    console.log("Resized");
    draw(storeData);
}); 


//======================================
//BUTTON EVENT LISTENERS
//======================================
document.querySelector("#start-button").addEventListener("click", function(){
    socket.emit("startGame", "");
})

//new ROOM CODE
document.querySelector("#testLink").addEventListener("click", function(){
    socket.emit("newRoom");
}); 

document.querySelector("#danger-alert-box-button").addEventListener("click", function(){
    document.querySelector("#danger-alert-box").classList.add("inactive-window");
    document.querySelector("#danger-alert-box-button").classList.add("inactive-window");
});

document.querySelector("#success-alert-box-button").addEventListener("click", function(){
    document.querySelector("#success-alert-box").classList.add("inactive-window");
    document.querySelector("#success-alert-box-button").classList.add("inactive-window");
});

document.querySelector("#backButton").addEventListener("click", function(){
    changeView();
    socket.emit("leave-room", "");
    roomId = undefined; 
    //reset all the variables
    storeData = [];
    seeData = [];
    gameData = [];
    roomId = undefined; 
    gameStarted = false;
    //note do not reset our own username.

    //reset room-chat 
    $(".room-chat-list").html("");

});


var allChatWindow1 = document.querySelectorAll(".all-chat-message-input")[0];
allChatWindow1.onkeyup = function (e, allChatWindow1) {
	//When enter is pressed in the chatmessageinput
    addAllChatEventListeners(e, this);
};

var allChatWindow2 = document.querySelectorAll(".all-chat-message-input")[1];
allChatWindow2.onkeyup = function (e, allChatWindow2) {
    //When enter is pressed in the chatmessageinput
    addAllChatEventListeners(e, this);
};

function addAllChatEventListeners(e, allChatWindow){
    // console.log("LOLOL" + e.keyCode);
    // console.log(allChatWindow);

    if (e.keyCode == 13) {
        var d = new Date();
        //set up the data structure:
        var message = allChatWindow.value;

        //only do it if the user has inputted something
        //i.e. dont run when its an empty string
        if(message && message.length > 0){
            //append 0 in front of single digit minutes
            var dateMinutes = d.getMinutes();

            var date = "" + d.getHours() + ":" + dateMinutes;
            var data = {
                date: date,
                message: message
            }

            //reset the value of the textbox
            allChatWindow.value = "";
            //send data to the server 
            socket.emit("allChatFromClient", data);

            //add the self chat
            var dateStr = "[" + data.date + "]";
            var str = "<li class=self>" + dateStr + " Me: " + data.message;

            $(".all-chat-list").append(str);
            
            scrollDown();
        }

    }
}

var roomChatWindow = document.querySelector(".room-chat-message-input");
roomChatWindow.onkeyup = function(e){
    if (e.keyCode == 13) {
        var d = new Date();
        //set up the data structure:
        var message = roomChatWindow.value;

        //only do it if the user has inputted something
        //i.e. dont run when its an empty string
        if(message && message.length > 0){
            //append 0 in front of single digit minutes
            var dateMinutes = d.getMinutes();

            var date = "" + d.getHours() + ":" + dateMinutes;
            var data = {
                date: date,
                message: message,
                roomId: roomId
            }

            //reset the value of the textbox
            roomChatWindow.value = "";
            //send data to the server 
            socket.emit("roomChatFromClient", data);

            //add the self chat
            var dateStr = "[" + data.date + "]";
            var str = "<li class=self>" + dateStr + " Me: " + data.message;

            $(".room-chat-list").append(str);
            
            scrollDown();
        }
    }
}





//======================================
//SOCKET ROUTES
//======================================
socket.on("username", function(username){
    ownUsername = username;
});

socket.on("allChatToClient", function(data){

	var date = "[" + data.date + "]";
	var str = "<li class=other>" + date + " " + data.username + ": " + data.message;

    console.log("all chat inc");

    $(".all-chat-list").append(str);

    scrollDown();
});

socket.on("roomChatToClient", function(data){

    var date = "[" + data.date + "]";
    var str = "<li class=other>" + date + " " + data.username + ": " + data.message;

    $(".room-chat-list").append(str);

    scrollDown();
});

socket.on("player-joined-lobby", function(username){
    var str = "<li class=server-text>" + username + " has joined the lobby!";
    $(".all-chat-list").append(str);
    scrollDown();
});

socket.on("player-left-lobby", function(username){
    var str = "<li class=server-text>" + username + " has left the lobby.";
    $(".all-chat-list").append(str);
    scrollDown();
});

socket.on("player-joined-room", function(username){
    var str = "<li class=server-text>" + username + " has joined the room!";
    $(".room-chat-list").append(str);
    scrollDown();
});

socket.on("player-left-room", function(username){
    var str = "<li class=server-text>" + username + " has left the room.";
    $(".room-chat-list").append(str);
    scrollDown();
});

socket.on("update-current-players-list", function(currentPlayers){
    console.log("update the current player list request received");
    console.log(currentPlayers);
    //remove all the li's inside the list
    $("#current-players-list li").remove();
    
    //append each player into the list
    currentPlayers.forEach(function(currentPlayer){
      var str = "<li>" + currentPlayer + "</li>";
      $("#current-players-list").append(str);
  });
});

socket.on("update-current-games-list", function(currentGames){
    console.log("update the current games list request received");
    console.log(currentGames);
    //remove all the li's inside the list
    $("#current-games-list li").remove();
    
    //append each player into the list
    currentGames.forEach(function(currentGame){
        //if the currentGame exists
        if(currentGame){
            var str = "<li id='list'>" + currentGame.roomId + ": " + currentGame.status + "</li>";
            
            //add the li to the list
            $("#current-games-list").append(str);

            //grab all li's
            var allLis = document.querySelectorAll("#current-games-list li");

            //add the event listener to the last li added.
            allLis[allLis.length - 1].addEventListener("click", function(){
                //JOIN THE ROOM
                // console.log(currentGame.roomId);
                socket.emit("join-room", currentGame.roomId);
                //change the view to the room instead of lobby
                roomId = currentGame.roomId;
                changeView();
            });
        }
    });
});

socket.on("new-game-created", function(str){
    var str = "<li class=server-text>" + str + "</li>";
    $(".all-chat-list").append(str);
});

socket.on("auto-join-room-id", function(roomID){
    console.log("auto join room");
    //received a request from server to auto join
    //likely we were the one who created the room
    //so we auto join into it
    socket.emit("join-room", roomID);
    //chang ethe view to the room instead of lobby
    changeView();
});




//======================================
//NOTIFICATION SOCKET ROUTES
//======================================
socket.on("alert", function(data){
    alert(data);
    window.location.replace("/");
});

socket.on("danger-alert", function(data){
    document.querySelector("#danger-alert-box").classList.remove("inactive-window");
    document.querySelector("#danger-alert-box-button").classList.remove("inactive-window");
    document.querySelector("#danger-alert-box").textContent = data + "        |        Press here to remove";
});

socket.on("success-alert", function(data){
    document.querySelector("#success-alert-box").classList.remove("inactive-window");
    document.querySelector("#success-alert-box-button").classList.remove("inactive-window");
    document.querySelector("#success-alert-box").textContent = data + "        |        Press here to remove";
});













socket.on("update-room-players", function(data){
    // var x = $("#typehead").parent().width();
    storeData = data;

    //remove all the li's inside the list
    $("#mainRoomBox div").remove();

    console.log("update room players");
    console.log(data);

    draw(data);
});

//======================================
//GAME SOCKET ROUTES
//======================================
socket.on("game-data", function(data){
    if(data){
        console.log("game starting!");

        console.log(data);
        // seeData = data; 
        gameData = data;

        gameStarted = true;

        draw(storeData);
    } 
});

socket.on("update-status-message", function(data){
    if(data){
        $("#status").textContent = data;
    }
});

//======================================
//FUNCTIONS
//======================================
function draw(data){
    console.log("draw called");

    if(data){
        var w = $("#mainRoomBox").width();
        var h = $("#mainRoomBox").height();

        var numPlayers = data.length;//3;
        var playerLocations = generatePlayerLocations(numPlayers, w/2, h/2);

        //generate the divs in the html
        var str = "";
        console.log("Game started: " + gameStarted);
        if(gameStarted === true){
            //draw the players according to what the client sees (their role sees)
            for(var i = 0 ; i < numPlayers; i++){

                console.log("draw");
                console.log("DATA: ");
                console.log(data);

                //check if the user is on the spy list. 
                //if they are not, they are res
                if(gameData.see.spies && gameData.see.spies.indexOf(data[i].username) === -1){
                    str = str + strOfAvatar(data[i], "res");
                } 
                //else they are a spy
                else{
                    str = str + strOfAvatar(data[i], "spy");
                }
            }    
        } 
        //when game has not yet started, everyone is a res image
        else{
            for(var i = 0 ; i < numPlayers; i++){
                str = str + strOfAvatar(data[i], "res");
            }  
        }

        // console.log(str);
        
        //draw the teamLeader star
        // str = str + "<span><img src='leader.png' class='leaderStar'></span>";



        //set the divs into the box
        $("#mainRoomBox").html(str);

        //set the positions and sizes
        console.log("numPlayers: " + numPlayers)
        var divs = document.querySelectorAll("#mainRoomBox div");
        for(var i = 0 ; i < numPlayers; i++){
            console.log("player position: asdflaksdjf;lksjdf");
            var offsetX = w/2 ;
            var offsetY = h/2 ;

            var strX = playerLocations.x[i] + offsetX + "px";
            var strY = playerLocations.y[i] + offsetY + "px";

            divs[i].style.left = strX;
            divs[i].style.bottom = strY;


            //size of the avatar img
            divs[i].style.width = 30 + "%";
            divs[i].style.height = 30 + "%";

            //get which one is smaller, width or height and then
            //force square
            if(divs[i].offsetWidth < divs[i].offsetHeight){
                divs[i].style.height = divs[i].offsetWidth + "px";
                // console.log("width smaller, make height smaller to square");
            } else{
                divs[i].style.width = divs[i].offsetHeight + "px";
                // console.log("height smaller, make width smaller to square");
            }

            //add the event listeners for button press
            divs[i].addEventListener("click", function(){
                console.log("avatar pressed");
                this.classList.toggle("highlight-avatar");
            });


            //team leader star part!
            if(gameStarted === false){
                //draw the team leader star in the specific div
                if(i === 0){
                    console.log("test");
                    //set the div string and add the star
                    var str = $("#mainRoomBox div")[0].innerHTML;
                    str = str + "<span><img src='leader.png' class='leaderStar'></span>";

                    //update the str in the div
                    $("#mainRoomBox div")[0].innerHTML = str;
                }
            }
            // else {
            //     var playerIndex = getUsernameIndex(gameData.teamLeader);
            //     if(i){
            //         //set the div string and add the star
            //         var str = $("#mainRoomBox div")[playerIndex].innerHTML;
            //         str = str + "<span><img src='leader.png' class='leaderStar'></span>";

            //         //update the str in the div
            //         $("#mainRoomBox div")[playerIndex].innerHTML = str;
            //     }
            // }
        }

        if(gameStarted === true){
            //draw missions and numPick
            //j<5 because there are only 5 missions/picks each game
            for(var j = 0; j < 5; j++){
                //missions
                var missionStatus = gameData.missionHistory[j];
                if(missionStatus){
                    if(missionStatus === "succeed"){
                        document.querySelectorAll(".missionBox")[j].classList.toggle("missionBoxSucceed");
                    } else{
                        document.querySelectorAll(".missionBox")[j].classList.toggle("missionBoxFail");
                    }
                }

                //draw in the number of players in each mission
                var numPlayersOnMission = gameData.numPlayersOnMission[j];
                if(numPlayersOnMission){
                    document.querySelectorAll(".missionBox")[j].innerText = numPlayersOnMission;
                }
            }    

            //picks
            var pickStatus = gameData.pickNum;

            for(var j = 0; j < pickStatus; j++){
                document.querySelectorAll(".pickBox")[j].classList.toggle("pickBoxFill");
            }
        }

    }
}

function getUsernameIndex(username){
    if(gameStarted === true){

        for(var i = 0; i < storeData.length; i++){
            if(storeData[i].username === username){
                return i;
            }
        }
    }
    else{
        return false;
    }
    
}

function strOfAvatar(playerData, alliance){
    var picLink;
    if(alliance === "res"){
        if(playerData.avatarImgRes){
            picLink = playerData.avatarImgRes;
        } else{
            picLink = 'base-res.png'    
        }
    }
    else{
        if(playerData.avatarImgSpy){
            picLink = playerData.avatarImgSpy;
        } else{
            picLink = 'base-spy.png'    
        }
    }


    var role = ""; 
    if(gameStarted === true){
        //if rendering our own player, give it the role tag
        if(playerData.username === ownUsername){
            role = gameData.role;
        }
        else if(gameData.see.merlins.indexOf(playerData.username) !== -1){
            role = "Merlin?";
        }  
    }


    return "<div><img class='avatarImgInRoom' src='" + picLink + "'><p class='username-p'>" + playerData.username + " </p><p class='role-p'>" + role + "</p></div>";    
}



function changeView(){
    $(".lobby-container").toggleClass("inactive-window");
    $(".game-container").toggleClass("inactive-window");

}

function scrollDown(){
    //scroll down
    // console.log($(".chat-window"));

    var chatWindows = $(".chat-window");

    for(var i = 0; i < chatWindows.length; i++){
        $(".chat-window")[i].scrollTop = $(".chat-window")[i].scrollHeight;
    }
}

function toRadians (angle) {
  return angle * (Math.PI / 180);
}

function generatePlayerLocations(numOfPlayers, a, b){
    //CONICS :D
    var x_ = [];
    var y_ = [];
    var step = 360/numOfPlayers;

    for(var i = 0; i < numOfPlayers; i++){
        //get the coordinates. Note the +90 is to rotate so that
        //the first person is at the top of the screen
        x_[i] = a*(Math.cos(toRadians((step*i) + 90)))*0.85;
        y_[i] = b*(Math.sin(toRadians((step*i) + 90)))*0.6;
    }

    var object = {
        x: x_,
        y: y_
    }
    return object;
}