function fibo(n) {
    if (n <= 1)
        return n;
    return fibo(n - 1) + fibo(n - 2);
}

var fib6 = fibo(6);
