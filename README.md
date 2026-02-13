# Books Library API App

## Built on NestJS Typescript, PostgreSQL, and Redis

## Documentation

Read the documentation [here](https://documenter.getpostman.com/view/49071923/2sBXcBnNKg).

## Penjelasan Pattern

Alasan saya memilih pattern tersebut (role/feature based) adalah saya memanfaatkan sifat enkapsulasi dari NestJS dimana tiap modul bertindak sebagai unit yang mandiri (module, service, controller). Dengan memisahkan logika berdasarkan role (Admin, User, Public), saya dapat memastikan bahwa service dan provider di dalam modul Admin tidak dapat diakses secara tidak sengaja oleh modul User kecuali diekspor secara eksplisit. Hal ini mencegah terjadinya unauthorized access, mempermudah penerapan security guards yang spesifik per directory route, serta membuat struktur kode lebih scalable dan mudah dipelihara seiring bertambahnya kompleksitas fitur di masing-masing route dir.