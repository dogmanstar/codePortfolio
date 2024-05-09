export {Primes};


class Primes {
    constructor() {
    }

    naivePrime(lookForPimesUpToNum) {
        let primesFound = [];
        for (let i = 2; i <= lookForPimesUpToNum; i++) {
            let isPrime = true;
            primesFound.forEach((number) => {
                if (i % number === 0) isPrime = false;
            });
            if (isPrime) {
                primesFound.push(i);
            }
        }
        console.log(primesFound);
    }

    bucketsPrime(lookForPimesUpToNum) {
        let primesFound = [];
        let buckets = [];

        for (let i = 3; i <= lookForPimesUpToNum; i += 2) {
            if (!buckets.includes(0)) {
                primesFound.push(i);
                buckets.push(0);
            }
            for (let i = 0; i < buckets.length; i++) {
                buckets[i] = (buckets[i] + 2) % primesFound[i];
            }
        }

        primesFound.unshift(2);
        console.log(primesFound);
    }

    sieveOfEratosthenes(lookForPimesUpToNum) {
        let sieve = [0, 1, 2];
        let maxDiv = Math.floor(lookForPimesUpToNum / 2);
        for (let i = 3; i <= lookForPimesUpToNum; i += 1) {
            if (i % 2 === 0) {
                sieve.push(0);
                continue;
            }
            sieve.push(i);
        }
        for (let i = 3; sieve[i] <= maxDiv; i++) {
            if (sieve[i] === 0) continue;
            for (let j = i + sieve[i]; j < sieve.length; j += sieve[i]) {
                if (sieve[j] === 0) continue;
                if (sieve[j] % sieve[i] === 0) {
                    sieve[j] = 0;
                }
            }
        }
        let cleanSieve = sieve.filter((num) => {
            return num !== 0;
        });
        cleanSieve.shift();
        console.log(cleanSieve);
    }

    // sieveOfEratosthenes(lookForPimesUpToNum) {
    //     let sieve = [2];
    //     for (let i = 3; i <= lookForPimesUpToNum; i += 2) {
    //         sieve.push(i);
    //     }
    //     for (let i = 1; i < sieve.length; i++) {
    //         for (let j = sieve.length -1; j > i; j--) {
    //             if (sieve[j] % sieve[i] === 0) {
    //                 sieve.splice(j, 1);
    //             }
    //         }
    //     }
    //     console.log(sieve);
    // }
}