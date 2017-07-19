alert("hei")

 var selector, elems, makeActive;

    selector = '.nav li';

    document.getElementsByTagName("ul").style.backgroundColor = "red";

    makeActive = function () {
    for (var i = 0; i < elems.length; i++)
        elems[i].classList.remove('active');

    this.classList.add('active');
    };

    for (var i = 0; i < elems.length; i++)
      elems[i].addEventListener('mousedown', makeActive);
