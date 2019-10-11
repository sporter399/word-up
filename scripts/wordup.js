

Vue.component('letter-chip', {
    
    template: '#letter-chip-template', 
    props: {
        letter: String,
        value: Number,
    },
});

Vue.component('submitted-word', {
   
    template: '#submitted-word-template',
    props: {
        word: String, 
        score: Number, 
        loading: Boolean, 
        isRealWord: Boolean, 
    },
});


var GAME_DURATION = 60;

var scrabblePointsForEachLetter = {
    a: 1, b: 3, c: 3, d: 2, e: 1, f: 4, g: 2, h: 4, i: 1, j: 8, k: 5, l: 1, m: 3,
    n: 1, o: 1, p: 3, q: 10, r: 1, s: 1, t: 1, u: 1, v: 4, w: 4, x: 8, y: 4, z: 10
}

function letterScore(letter) {
    
    return scrabblePointsForEachLetter[letter.toLowerCase()];
}


function wordScore(word) {
    
    var letters = word.toString().split("");
    let letterScores = letters.map(l => scrabblePointsForEachLetter[l])    
    
   
    return letterScores.reduce(add, 0);
}


function chooseN(n, items) {
    var selectedItems = [];
    var total = Math.min(n, items.length);
    for (var i = 0; i < total; i++) {
        index = Math.floor(Math.random() * items.length);
        selectedItems.push(items[index]);
        items.splice(index, 1);
    }
    return selectedItems;
}


function add(a, b) {
    return a + b;
}

var app = new Vue({
    el: '.mount-point',
    
    data: function() {
        
        return {
            isTextDisabled: true,
            secondsRemaining: GAME_DURATION,
            allowedLetters: [],
            currentAttempt: "",
            wordSubmissions: [],
            timer: null,
            
        };
    },
    computed: {

        gameIsOver: function () {
            if (this.secondsRemaining === 0) {
                return true;
            } else
                return false;
                

        },
        
        currentScore: function () {
            JSON.stringify(this.wordSubmissions);  
            scoreTotal = 0;          
             
            for (var i = 0; i < this.wordSubmissions.length; i++) {
                
               var retWord = this.wordSubmissions[i];
               if (Boolean(retWord.isRealWord) == true) {
                   scoreTotal += retWord.score;
               }

            }
            return scoreTotal;
        },
         
        gameInProgress: function() {
            return this.secondsRemaining > 0 && this.timer !== null;
        },
        disallowedLettersInWord: function() {

            var letters = this.currentAttempt.split("");
            return letters.filter(l => this.isDisallowedLetter(l));
        },

        containsOnlyAllowedLetters: function() {
           
            return this.disallowedLettersInWord.length === 0;
        },

    },
    methods: {
        isDisallowedLetter: function(letter) {
           
            if (this.allowedLetters.includes(letter)) {
            
                return false;
            } else
                return true;
            
        },

        letterScore: letterScore,
        wordScore: wordScore,

        generateAllowedLetters: function() {
            
            return chooseN(7, Object.keys(scrabblePointsForEachLetter));
        },


        startGame: function() {

            document.getElementById("userInput").focus();
            this.endGame(); 
            this.isTextDisabled = false;
            this.gameHasStarted = true;
            this.secondsRemaining = GAME_DURATION,
            this.allowedLetters = this.generateAllowedLetters();
            this.wordSubmissions = [];
            this.currentAttempt = '';
            this.timer = this.startTimer();
        },
        endGame: function() {
            this.stopTimer();
        },
        addNewWordSubmission: function(word) {
           
            document.getElementById("userInput").value = "";
            
            let alreadyUsed;
            for (var i = 0; i < this.wordSubmissions.length; i++){
                if (this.wordSubmissions[i].word == word){
                    alreadyUsed = true;
                    return;
                }
                alreadyUsed = false;
            }
            if (this.containsOnlyAllowedLetters && !alreadyUsed) {
               
                wordProps = { 
                    word: word, 
                    score: wordScore(word),
                    loading: true 
                }
                this.wordSubmissions.push(wordProps);
                this.checkIfWordIsReal(wordProps);
                
            }
            this.currentAttempt = "";
        },
        checkIfWordIsReal: function(word) {
         
            fetch('https://www.dictionaryapi.com/api/v3/references/collegiate/json/' + word.word + '?key=e5b3dbff-24df-4742-90be-a8c3301c9e18')
                .then(response => (response.ok ? response.json() : Promise.reject(response)))
                .then(resp => {
                   if (typeof resp[0] !== "string") {
                        
                        word.isRealWord = true;
                        word.loading = false;
                        
                    } else {
                        word.isRealWord = false;
                        word.loading = false;
                    }  
                   
                })
                .catch(error => console.error(error));
        },


        startTimer: function() {

            this.stopTimer(); 
            this.secondsRemaining = GAME_DURATION;
            this.timer = setTimeout(() => this.tick(), 1000);
        },
        tick: function() {
            
            this.secondsRemaining -= 1;
            if (this.secondsRemaining > 0) {
                
                this.timer = setTimeout(() => this.tick(), 1000);
            }
        },
        stopTimer: function() {
            if (this.timer) {
                clearTimeout(this.timer);
            }
        },
    },
});
