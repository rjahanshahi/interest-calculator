console.log('Client-side code running');
//SUBMIT FORM NOTES
/*
the html form automatically submits a POST request (instead of it being manual from the client.js), and the data is instead in the form of urlencoded
*/
const form = document.getElementById('form');
const loginBtn = document.getElementById('submitLogin');
const outputEl = document.getElementById('output');

loginBtn.addEventListener('click', (e) => {
    // prevent the form from submitting
    e.preventDefault();
    login();
});

function containsSpecialChars(str) {
    const specialChars =
      /[`!@#$%^&*()_+\-=\[\]{}; ':"\\|,.<>\/?~]/;
    return specialChars.test(str);
  }

const login = async () => {
    try {
        const formData = new FormData(form)
        //check for special characters
        const username = formData.get('user');
        if (containsSpecialChars(username)) {
            outputEl.style.visibility = 'visible';
            return outputEl.innerHTML = `Invalid username! ${username} contains illegal characters!`
        }

        const response = await fetch('/login', {
            method: 'POST', 
            body: formData,
            credentials: 'include',
        });
        const result = await processResponse(response);
        if (response.ok) {
            //store token in local storage (not safe!)
            console.log(result.message);
            //localStorage.setItem("token", result['accessToken']);
            window.location.href = "./index.html";
        } 
    } catch (err) { 
        console.error(err);
    }
}

const processResponse = async (response) => {
    if (!response.ok) {
        const result = await response.text();
        outputEl.style.visibility = 'visible';
        outputEl.innerHTML = `${result}`;
        console.error(result);
        return result;
    }
    else { //later add checks for json type 
        const result = await response.json();
        console.log(result);
        return result;
    }
}


