window.onload = function (){
    fsss.attachAutocompleteWidget(document.getElementById("search-bar"))
}
function submit(event){
    event.preventDefault()
    if(document.getElementById("search-bar").value){
        document.getElementById("search-form").submit()
    }
}