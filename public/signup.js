console.log('Client-side code running');
//SUBMIT FORM NOTES
/*
the html form automatically submits a POST request (instead of it being manual from the client.js), and the data is instead in the form of urlencoded
*/
const form = document.getElementById('form');
const signupBtn = document.getElementById('submitSignup');
const outputEl = document.getElementById('output');

signupBtn.addEventListener('click', (e) => {
    // prevent the form from submitting
    e.preventDefault();
    signup();
});

function containsSpecialChars(str) {
    const specialChars =
      /[`!@#$%^&*()_+\-=\[\]{}; ':"\\|,.<>\/?~]/;
    return specialChars.test(str);
  }

const signup = async () => {
    try {
        const formData = new FormData(form);
        const username = formData.get('user');
        const password = formData.get('pass');
        if (!username||!password) {
            outputEl.style.visibility = 'visible';
            return outputEl.innerHTML = `Both username and password are required!`;
        }
        const usernameEl = document.getElementById('user');
        const passwordEl = document.getElementById('pass');
        //still need to add server side validation for best practice
        if (!usernameEl.checkValidity()) {
            outputEl.style.visibility = 'visible';
            return outputEl.innerHTML = `Invalid username, 6-30 characters!`;
        }
        console.log(passwordEl.checkValidity())
        if (!passwordEl.checkValidity()) {
            outputEl.style.visibility = 'visible';
            return outputEl.innerHTML = `Invalid password, minimum 8 characters!`;
        }
        //check for special characters
        
        if (containsSpecialChars(username)) {
            outputEl.style.visibility = 'visible';
            return outputEl.innerHTML = `Invalid username! ${username} contains illegal characters!`;
        }

        const response = await fetch('/signup', {
            method: 'POST', 
            body: formData
        });
        processResponse(response);
    } catch (err) { 
        console.error(err);
    }
}

const processResponse = async (response) => {
    if (!response.ok) {
        const result = await response.text();
        outputEl.style.visibility = 'visible';
        outputEl.innerHTML = result;
        console.error(result);
    }
    else { //later add checks for json type 
        const result = await response.json();
        outputEl.style.visibility = 'visible';
        outputEl.innerHTML = result['message'];
        console.log(result);
    }
}


