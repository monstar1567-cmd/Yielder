![yielder](logo.png)
# Yielder
Yielder is a programming language developed by Monstar1567 in October 2026.

## Useful Links
[Documentation:](https://monstar1567.neocities.org/yielder/)

[GitHub:](https://monstar1567.neocities.org/not_found/)


## Notes
All script files must be stored in the "scripts" folder.
When running the scripts, run "main.js" in the main folder.

## Syntax
1. literals, like strings, numbers (not floats as of now), booleans, none, and tables

```yd
main {
    print "Hello world!";
}
```

```yd
main {
    print 12+2;
}
```

```yd
main {
    print true and false;
}
```

```yd
main {
    print none;
}
```

```yd
main {
    print {
        a: 12,
        b: "15"
    };
}
```

2. operators, binary, comparison, logical
>binary operators (+, -, *, /, mod, ^) operate on numbers, return numbers
```yd
main {
    print 12 + 2;  # 14
    print 12 - 2;  # 10
    print 12 * 2;  # 24
    print 12 / 2;  # 6
    print 12 mod 2;  # 0
    print 12 ^ 2;  # 144
}
```

>comparison operators (==, <, >, <=, >=, !=) operate on numbers, return booleans
```yd
main {
    print 12 == 2;  # false
    print 12 < 2;  # false
    print 12 > 2;  # true
    print 12 <= 2;  # false
    print 12 >= 2;  # true
    print 12 != 2;  # true
}
```

>logical operators (not, or, and, xor, nor, nand, xnor) operate on booleans, return booleans
```yd
main {
    print not true;  # false
    print true or false  # true
    print true and false  # false
    print true xor false  # true
    print true nor false  # false
    print true nand false  # true
    print true xnor false  # false
}
```

3. keywords
>**var**: declares a variable, assigns an identifier to a value that can be used later
```yd
main {
    var x = 12;

    print x + 1;  # 13
}
```

>**func**: declares a function, an identifier that can do an action, with parameters
```yd
main {
    func add(x, y) {
        rtn x + y;
    }

    print add(3, 4);  # 7
}
```

>**if**: performs an action if a condition is true
>**else**: performs a different action if the original condition is not true
>**elseif**: performs a different action if a different condition is true and the original condition is not true
```yd
main {
    if 1 > 2 {
        print true;
    } elseif 1 < 2 {
        print false;
    } else {
        print none;
    }
}
```

>**while**: repeatedly performs an action until a condition is no longer deemed true
```yd
main {
    var i = 0;

    while i < 100 {
        print i;
        i = i + 1;
    }
}
```

>**repeat**: repeatedly performs an action a certain amount of times
```yd
main {
    var i = 0;

    repeat 10 {
        i = i + 1;
        print "hello world "+i+" times!";
    }
}
```

>**print**: sends a value or message to the output
```yd
main {
    print "Hello world!";
}
```

>**main**: the main function that the compiler actually compiles
```yd
main {
    print 12+1;
}
```

>**match**: tests a value against cases, performing an action if it matches, otherwise if it "fails", does another action if it exists
```yd
main {
    var day = "Thursday";

    match day {
        case "Saturday" or "Sunday" {
            print "Enjoy the weekend!";
        }
        fails {
            print "Looking forward to next week!";
        }
    }
}
```
