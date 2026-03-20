// Dropdown menu btn
const menuBtn = document.querySelector('.dropdown-btn')
const menu = document.querySelector('.dropdown-content')


//forms submit
const formReset = document.querySelector('#card');
let username;
const fbtn = document.querySelector('#fbtn');

fbtn.addEventListener('click', async(event)=>{
     event.preventDefault();
    username = document.querySelector('#username').value;
    const date = new Date();
    console.log(date);
    const timeZone = document.querySelector('#timeZone');
    timeZone.textContent = username + ' joined ' + date;

    alert('Wellcome '+ username);
   formReset.reset();
})

menuBtn.addEventListener('click', (event) => {
    event.stopPropagation(); 
    menu.classList.toggle('active');
});

window.addEventListener('click', (event) => {
    if (menu.classList.contains('active') && !menu.contains(event.target)) {
        menu.classList.remove('active');
    }
});

