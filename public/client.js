console.log('Client-side code running');
//SUBMIT FORM NOTES
/*
the html form automatically submits a POST request (instead of it being manual from the client.js), and the data is instead in the form of urlencoded
*/
const btn = document.getElementById('getNumber');
const outputEl = document.getElementById('output');
const deleteBtn = document.getElementById('deleteUser');
const refreshBtn = document.getElementById('refresh')

btn.addEventListener('click', async (e) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/getNumber', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    processResponse(response)
})
//refresh access token
refreshBtn.addEventListener('click', async (e) => {

    const refreshResponse = await fetch('/refresh', {
        method: 'GET',
        credentials: 'include',
    });
    const newAccessToken = await refreshResponse.json()
    localStorage.setItem('token',newAccessToken['accessToken']);
});


deleteBtn.addEventListener('click', async (e) => {
    const token = localStorage.getItem('token');
    const response = await fetch('/deleteUser', {
        method: 'DELETE',
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    const result = processResponse(response);
    //for now only removing token on client side after account deleted
    //token still has NOT been invalidated on the server side
    if (response.ok) {localStorage.removeItem('token')}; 
})

const processResponse = async (response) => {
    if (!response.ok) {
        const result = await response.text();
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

