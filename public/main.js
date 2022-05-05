//Focus div based on nav button click
//Add code??

//Flip one coin and show coin image to match result when button clicked
const coin = document.getElementById("coin")
coin.addEventListener("click", flipCoin)

async function flipCoin() {
    //Flip endpoint
    const ep = "app/flip/"
    const url = document.baseURI + ep

    await fetch(url)
  		    .then(function(response) {
    		    return response.json();
  		    })

			.then(function(results) {
				console.log(results);
				document.getElementById("result").innerHTML = results.flip;
                //Show image for coin flip 
                const whichImage = results.flip; 
				document.getElementById("quarter").setAttribute("src", "assets/img/" + whichImage + ".png");
			})
  };

//Flip multiple coins and show coin images in table as well as summary results
const multCoins = document.getElementById("coins")  
multCoins.addEventListener("submit", flipMult)
  
async function flipMult(event) {
    //Don't reload
    event.preventDefault();
  
    //Flip multiple coins endpoint
    const ep = "app/flip/coins/"
    const url = document.baseURI + ep
    
    //Enter number and press button to activate coin flip series
    //Create const which can be fed to API 
    const formEvent = event.currentTarget

    try {
        const formData = new FormData(formEvent);
        //sendFlips referenced below all endpoint calls??
        const results = await sendFlips({ url, formData });
  
        document.getElementById("heads").innerHTML = "Heads: " + results.summary.heads;
        document.getElementById("tails").innerHTML = "Tails: " + results.summary.tails;
        //Function below 
        document.getElementById("coinlist").innerHTML = coinList(results.raw);

      } catch (error) {
          console.log(error);
        }
  }

//Guess a flip by clicking either heads or tails button
const call = document.getElementById("call")
call.addEventListener("submit", guess)

async function guess(event) {
    event.preventDefault();

    //Guess endpoint
	const ep = "app/flip/call/"
	const url = document.baseURI + ep

    //Create const for API
	const formEvent = event.currentTarget

	try {
		const data = new FormData(formEvent); 

        //Data in API, process results
		const results = await sendFlips({ url, data });
       
		document.getElementById("choice").innerHTML = "Guess: " + results.call;
		document.getElementById("actual").innerHTML = "Actual: " + results.flip;
		document.getElementById("results").innerHTML = "Result: " + results.result;

        //Retrieve image 
        document.getElementById("coingame").innerHTML = '<li><img src="assets/img/' + results.call + '.png" class="bigcoin" id="callcoin"></li><li><img src="assets/img/' + results.flip + '.png" class="bigcoin"></li><li><img src="assets/img/' + results.result + '.png" class="bigcoin"></li>';
	} catch (error) {
		console.log(error);
	}
}

//sendFlips for endpoints 
async function sendFlips({ url, formData }) {
    const rawFormData = Object.fromEntries(formData.entries());
    const formDataJSON = JSON.stringify(rawFormData);

    const op = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json"
        },
        body: formDataJSON
    }

    const res = await fetch(url, op);
    return res.json();
}

//Navigation buttons
//Home OR none
function home () {
    document.getElementById("home").className =  "active"; 
    document.getElementById("single").className =  "inactive"; 
    document.getElementById("multiple").className =  "inactive"; 
    document.getElementById("guess").className =  "inactive"; 
}

//Single coin flip 
function single () {
    document.getElementById("home").className =  "inactive"; 
    document.getElementById("single").className =  "active"; 
    document.getElementById("multiple").className =  "inactive"; 
    document.getElementById("guess").className =  "inactive"; 
}

//Multiple coin flips
function multiple () {
    document.getElementById("home").className =  "inactive"; 
    document.getElementById("single").className =  "inactive"; 
    document.getElementById("multiple").className =  "active"; 
    document.getElementById("guess").className =  "inactive"; 
}

//Guess coin flips
function guess () {
    document.getElementById("home").className =  "inactive"; 
    document.getElementById("single").className =  "inactive"; 
    document.getElementById("multiple").className =  "inactive"; 
    document.getElementById("guess").className =  "active"; 
}


//coinList loop to output results 
function coinList(array) {
    let text = "";
    let arrayLength = array.length
    for (let i = 0; i < arrayLength; i++) {
      text += '<li><img src="assets/img/' + array[i] + '.png" class="bigcoin"></li>';
    }
    return text
}