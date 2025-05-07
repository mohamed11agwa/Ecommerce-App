const isEmailValid =(v) => {
    let emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(v);
}

const isPassValid = (v) =>{
    let passRegex =  /^.{6,}$/;
    return passRegex.test(v);
}