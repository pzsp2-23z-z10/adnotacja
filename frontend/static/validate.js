function validateForm() {
    var checkboxes = document.querySelectorAll('input[type="checkbox"]');
    var atLeastOneChecked = Array.from(checkboxes).some(checkbox => checkbox.checked);

    if (!atLeastOneChecked) {
        alert("Wybierz co najmniej jeden algorytm przed zatwierdzeniem formularza.");
        event.preventDefault();
    }
}
