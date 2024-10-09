# Fides WorkShop Project
Il progetto nasce da una sfida lanciata dall azienda Fides all interno del network 42 Italia. Fides ha chiesto di concentrarsi sullo sviluppo di una architettura a microservizi.
L impostazione del progetto lascia notevole spazio per quanto riguarda il design dell App,  la nostra app permetterà di prenotare hotel e bici per spostarsi. Il focus del 
nostro progetto è comunque rivolto all Architettura del progetto e allo sviluppo migliore del design interno di ogni microservizio. 

## Contributors
- [Riccardo Leone](https://github.com/PapaLeoneIV)
- [Emma Veronelli](https://github.com/minestrinad)

## Build prerequisites
Tutti gli strumenti che potrebbero servirvi to build the project:
- make
- docker

## Architecture

Il backend è stato progettato per rispecchiare le dinamiche di business del progetto, applicando varie soluzioni e pattern:
  - Microservizio di gestione degl ordini                                   (Design State Pattern)
  - Microservizio per la validazione della prontazione in hotel             (Repository Pattern)
  - Microservizio per la validazione della protazioni di bici da trekking   (Repository Pattern)
  - Microservizio per la conferma di pagamento                              (Repository Pattern)

## How to build it
- from the root directory:
```
make all
`````

