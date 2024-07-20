const form = document.getElementById('interestForm')
const output = document.getElementById('output')
const btn = document.getElementById('save')
const saveOutput = document.getElementById('saveOutput')
const currentUser = document.getElementById('currentUser')
const loginBtn = document.getElementById('login')
const getDataBtn = document.getElementById('getData')
const logoutBtn = document.getElementById('logout')
const googleLoginBtn = document.getElementById('googleLogin')

//clear calculation data when reloading page and check login status
window.onload = async () => {
    localStorage.clear('total');
    //check login status by attempting access token refresh 
    try {
        
        const refreshResponse = await fetch('/refresh', {
            method: 'GET',
            credentials: 'include',
        });
        //refresh successful, update access token and try original request again
        if (refreshResponse.ok) {
            currentUser.innerHTML = 'Logged In';
            loginBtn.style.display = 'none'; //hide login button
            googleLoginBtn.style.display = 'none'; //hide google login button
            logoutBtn.style.visibility = 'visible'; //show logout button
        } else {
            logoutBtn.style.display = 'none'
        }
    } catch (error) {
        console.error(error);
    };    
}

form.addEventListener('submit', (e) => {
    const formData = new FormData(form)
    e.preventDefault();
    const formDataObj = {};
    for (const pair of formData.entries()) {(formDataObj[pair[0]] = pair[1])};

    const {interest, time, investment, compound} = formDataObj;
    const total = investment * ((1 + (interest * 0.01) / compound)**(compound * time));
    localStorage.setItem('total', Math.round(total * 100) / 100);
    output.innerHTML = `Your total savings will be $${Math.round(total * 100) / 100} dollars in ${time} years!`;
    output.style.visibility = 'visible';
});

btn.addEventListener('click', async (e) => {
    const total = localStorage.getItem('total');
    if (!total) {
        saveOutput.innerHTML = `No data to save!`;
        saveOutput.style.visibility = "visible";
        return 
    }
    //attempt to save data
    const response = await fetch('/saveData', {
        method: 'PUT',
        body: JSON.stringify({data: total}),
        headers: {
            'Content-Type' : 'application/json',
        }
    });
    const result = await response.json()
    if (response.ok) {
        saveOutput.innerHTML = `Saved!`;
        saveOutput.style.visibility = "visible";
        return
    }
    //if invalid token
    if (response.status === 401 || result.error === 'invalid_token') {
        //try issuing new access token
        attemptRefresh();   
    }
});

getDataBtn.addEventListener('click', async () => {
    const response = await fetch('/getData', {
        method: 'GET', 
        credentials: 'include',
        headers: {
            'Content-Type' : 'application/json',
        }
    });
    const result = await response.json()
    if (response.ok) {
        console.log(result.data)
        if (result.data === undefined) {
            saveOutput.innerHTML = "No save data found!";
            return saveOutput.style.visibility = "visible";
        }
        saveOutput.innerHTML = `${result.user}'s data: ${result.data}`;
        saveOutput.style.visibility = "visible";
    }
    //if invalid token
    if (response.status === 401 || result.error === 'invalid_token') {
        //try issuing new access token
        attemptRefresh();
    }

    
})

async function attemptRefresh() {
    try {
        const refreshResponse = await fetch('/refresh', {
            method: 'GET',
            credentials: 'include',
            
        });
        //refresh successful, update access token and try original request again
        if (refreshResponse.ok) {
            //refresh successful, user is logged in
            //const newAccessToken = await refreshResponse.json()
            //localStorage.setItem('token',newAccessToken['accessToken']);
            saveOutput.innerHTML = "try again, access token updated";
            saveOutput.style.visibility = "visible";
            return
        } else {
            //refresh failed, user is logged out
            loginBtn.style.visibility = "visible";
            googleLoginBtn.style.visibility = "visible";
            currentUser.innerHTML = 'Logged Out';
            saveOutput.innerHTML = "You must be logged in!";
            saveOutput.style.visibility = "visible";
            logoutBtn.style.display = 'none';
            return
        }
    } catch (error) {
        console.error(error);
    }; 
}

logoutBtn.addEventListener('click', async () => {
    const response = await fetch('/logout', {
        method: 'GET', 
        credentials: 'include'
    });
    location.reload()

})
