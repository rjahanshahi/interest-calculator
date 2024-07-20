const googleLoginLink = document.getElementById("googleLogin");

googleLoginLink.addEventListener('click', async (e) => {
    window.location.href = 'https://interest-calculator.azurewebsites.net/auth/google'
})

