var x = 1;
for (var i = 0; i < 5; i++) {
    y += 1; // y is not defined => Error here
    if (i == 3)
        debugger;
    x += i;
}