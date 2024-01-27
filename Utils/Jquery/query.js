$(document).ready(function () {

    $(".settings_btn").click(()=> {
        $(function() {
            $(".subpage").css({
                "display": "block"
            });
            $(".form").slideDown(350);
        });
    });
    $(".close_btn").click(()=> {
        $(".form").slideUp(350, ()=> {
            $(".subpage").css({
                "display": "none"
            });
        });
    });
    

});