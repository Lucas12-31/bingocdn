// --- script.js (Versão Completa com Regras Dinâmicas e PDF) ---

// Cores oficiais da Casa de Negócios para o PDF
const COR_AZUL = [0, 45, 83];
const COR_AMARELO = [243, 171, 0];

// Variáveis de Controle do Jogo
let numerosDisponiveis = [];
let numerosSorteados = [];
let jogoAtivo = false;
let qtdCartelasJogando = 0;

// *** ESPAÇO PARA SUA IMAGEM CENTRAL ***
// Dica: Cole aqui o Base64 da sua imagem para aparecer no meio da cartela.
const imagemCentroBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMgAAADICAYAAACtWK6eAAAAtGVYSWZJSSoACAAAAAYAEgEDAAEAAAABAAAAGgEFAAEAAABWAAAAGwEFAAEAAABeAAAAKAEDAAEAAAACAAAAEwIDAAEAAAABAAAAaYcEAAEAAABmAAAAAAAAAGAAAAABAAAAYAAAAAEAAAAGAACQBwAEAAAAMDIxMAGRBwAEAAAAAQIDAACgBwAEAAAAMDEwMAGgAwABAAAA//8AAAKgBAABAAAAyAAAAAOgBAABAAAAyAAAAAAAAACKGshfAAAACXBIWXMAAA7EAAAOxAGVKw4bAAAFTGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPD94cGFja2V0IGJlZ2luPSfvu78nIGlkPSdXNU0wTXBDZWhpSHpyZVN6TlRjemtjOWQnPz4KPHg6eG1wbWV0YSB4bWxuczp4PSdhZG9iZTpuczptZXRhLyc+CjxyZGY6UkRGIHhtbG5zOnJkZj0naHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyc+CgogPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9JycKICB4bWxuczpBdHRyaWI9J2h0dHA6Ly9ucy5hdHRyaWJ1dGlvbi5jb20vYWRzLzEuMC8nPgogIDxBdHRyaWI6QWRzPgogICA8cmRmOlNlcT4KICAgIDxyZGY6bGkgcmRmOnBhcnNlVHlwZT0nUmVzb3VyY2UnPgogICAgIDxBdHRyaWI6Q3JlYXRlZD4yMDI2LTA0LTE3PC9BdHRyaWI6Q3JlYXRlZD4KICAgICA8QXR0cmliOkRhdGE+eyZxdW90O2RvYyZxdW90OzomcXVvdDtEQUhIRzJtMkFWTSZxdW90OywmcXVvdDt1c2VyJnF1b3Q7OiZxdW90O1VBRTlIVWFVcjdNJnF1b3Q7LCZxdW90O2JyYW5kJnF1b3Q7OiZxdW90O0JBRTlIZHRqR19nJnF1b3Q7fTwvQXR0cmliOkRhdGE+CiAgICAgPEF0dHJpYjpFeHRJZD42MTJmNDE3NS05OWQyLTQ0NzctODVkNi1hYjE5OTgwNTlkMDQ8L0F0dHJpYjpFeHRJZD4KICAgICA8QXR0cmliOkZiSWQ+NTI1MjY1OTE0MTc5NTgwPC9BdHRyaWI6RmJJZD4KICAgICA8QXR0cmliOlRvdWNoVHlwZT4yPC9BdHRyaWI6VG91Y2hUeXBlPgogICAgPC9yZGY6bGk+CiAgIDwvcmRmOlNlcT4KICA8L0F0dHJpYjpBZHM+CiA8L3JkZjpEZXNjcmlwdGlvbj4KCiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0nJwogIHhtbG5zOmRjPSdodHRwOi8vcHVybC5vcmcvZGMvZWxlbWVudHMvMS4xLyc+CiAgPGRjOnRpdGxlPgogICA8cmRmOkFsdD4KICAgIDxyZGY6bGkgeG1sOmxhbmc9J3gtZGVmYXVsdCc+RGVzaWduIHNlbSBub21lIC0gMTwvcmRmOmxpPgogICA8L3JkZjpBbHQ+CiAgPC9kYzp0aXRsZT4KIDwvcmRmOkRlc2NyaXB0aW9uPgoKIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PScnCiAgeG1sbnM6cGRmPSdodHRwOi8vbnMuYWRvYmUuY29tL3BkZi8xLjMvJz4KICA8cGRmOkF1dGhvcj5MdWthcyBNYXR0b3MgTGltb2Vpcm88L3BkZjpBdXRob3I+CiA8L3JkZjpEZXNjcmlwdGlvbj4KCiA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0nJwogIHhtbG5zOnhtcD0naHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyc+CiAgPHhtcDpDcmVhdG9yVG9vbD5DYW52YSBkb2M9REFISEcybTJBVk0gdXNlcj1VQUU5SFVhVXI3TSBicmFuZD1CQUU5SGR0akdfZzwveG1wOkNyZWF0b3JUb29sPgogPC9yZGY6RGVzY3JpcHRpb24+CjwvcmRmOlJERj4KPC94OnhtcG1ldGE+Cjw/eHBhY2tldCBlbmQ9J3InPz4j11KgAAAYRklEQVR4nO2dCZgU1bXHD7KIgqIYgguI+lB2ZrqrB3kmZhKNLy7s2NNVDYageSbxxZho1KdflGhi1IghxiVqXJ5b0GFmumcciT4xuDx9Go0Yg1F8irjGDQRxBIHpev97q7qnB8ea6ZmqXqb//+87XzXDTFfdc+6v7jn31iJCURRFURRFURRFURRFURRFURRFURRFURRFURRFURRFURRFURRFURRFBS9bpE8pW6H9R1EUVX6yF8ku9jPSP7VcdrVvlYF2rexWUqaOWdlqGYC2DLBXSj/bRps4qlDdlYZCmepg9RK2k7LQTsgv7Qa5Hp9vhf1XSVhCbsH2OtgV+HwBtv+BNkTtOvkKoDkI7RsMWPpi65hqs42UzGZaRnUg1TH09g7ZDx1qut0ovwAg9amkPI7OtRr2Kj6vKyF7Dcf8CtryEj7/DfYX/Pth2H2pRrkTP/8t2nc+bCHsKIAzSoGS8YeqX1xoChcVqmikOkRqqYxDZ/mR6kToQO8Ckla7GezcC2sqUbs3y9JtScIS8gnsddiTaOfdepRMyHfw+Sj8/xjYHoWOCVUk0qmGOoMm5VewNTjD7sC2VQOSlBS2abNLzNqOPZllTrtaVTvdtm6HbcHnt7F9AKnYJYDleNhIjCpDYQMKHSOqAMqkVaojJOVynZIkZVsRdOyCGNKwHXpkScr72K6G3QM7DYCMt6/UhX/fdJ1S6NhReRKCvq9OLZLyd302LYKOWlBLp2UYZQDMBmyfhW8UKGfBjPRowjWWXq7M6NEoxyLwD8JadOcozVTKX2tLxbQv9IkjIS/CboDFU82o1Wplt0LHkApYeirXmQJNd4jCd87is5SuxxzbAnsZNcpi+O1I2F5qpqvQcaR8Vmb0aJB/RQeodUcOWmfmnEQ+g32IzyuwPdW+S/Z20y2C0luUBcj3Ve3B0SNHU9PFKiVNyF/d0eQItfCY7VuqhJUFyGWAY6M7pVv4jlcq1nZCaXVnvJap2sSul/2YcvUCZU3v/l4Fm7NXPQBFmTPr9Sg+n5yqlxHZK/JUCSp9lkNQb1bBJSC+gKJqk2cxKp+JE89BXC8pYWUAURf0ERB/rEmDshU+fQ52vl0nY7WPuVZSesqkWEm5iYD4ZikXlG3w6/MakrvkUNYkJagMIE0ApJmA+GpuAa+uIMb2HNhwQlJiIiCBm4JEXQD5V30/zc0yTPub6VZpiIDkwVRNkkBNou5BaZB/sx+QQSzaS0QEJA+Wnv5tks3qYsdUg1Rn+54qYhGQvILiLMIm5Bq7DkU710iKXwQkr4Ckb9R6FZBcBH/vXej4U50or4Akd7qbL59WLJfuq6sVnJuxHoHNSt0he2r/s2gvTuUNkJ3vCS+EZV+pXGBoAMl6ffNVUsZkx4EqMuUDEH3GTOrLwt+CvZlvSyXkbRzDe9huQPs+1bVA+kEOBRpFXF+/h1HkFNQiwwrdD6gvUKCApGdv1FXCCanVl4Orh0Ek5NI8WXpfV7p3AKorbZ+ArdW30Cb1Pedb3eI5v6OJM/Xboqd+62VGdiyoIlLggNynR5B19jKZiTPlwdqWykF5M7W/OjkEcB6GjjgR2ymwabCzYbehvatwnJvcY87r3ZTu7bstOI6fqYLdjnJWq+gUcIrVqgDB9hV0gq/qh68VQTGK4+gHeEbqY1L3biT0I45WYPsBLJWBO18jSaPcj2OZyUcKFaHyNoKgA6gZm8wjPQts7XxQL1/GsZ6o07AGeRbbTXmrUZxZrfXY59Xqll19PEVwEqFc5Q2QpMywi/AJhe5jRfuh/burYhnpWAydtV6PJs5D5IIdSdT3O/XIgwC1Sj0cvNA+obJU7oDsLHWMqqNiJLlY30LrjCLB3YbcNpGxFpD8wv6T7KePgwV7cYiAONIjSdoXz0h/HP8EHO8i3XGDhqRRjyBbUw3yuJpI0MfAy+KLQwSkvTL+qJW++p7yRrkUvlkbaD3irovg8zt6hg3FOkeQIhEB+WLpl+yoaWK1lpKUTYFdZeCmWapYTzXJhWqfev8s1guvEgekTw7WLbkv1ZmiZpngm4/cesHvwj3l3sfeAl8tt+vka3rfwY0igfqsV6lEAek4gOPHD5Bh1YNFort18P/dCrquTZw3bB2FdqxEuzYHmGq1qsti1NqM3re/gHTcfsPoL5OPGSQjpiqfdVT3lDcoJQqIIyM6RCZFx8jk6Ffx+QSJxE8So+Z7Uhk7BRaVyppv4v8NqYgeIFLdr0f+uUu+ZKtXt6lXITQFOopsRx1ynn6Mqf+Feh8ZfeyeMgY+q4wdIYZ1vETM+RKOnSoGfBY2ayQ092hYRKbMHiEymlPOJQhIH6muHigVJxyAoM5EkBeLYf4ZcLwsRnwDPn+Cn22EvY3Pq2BLYacDlEkyKb53T0BRT0vEGf5O9/bZYNZHFCDqIX71UuErIKOP3RUnkQOlwjwB/rgCtgJwvAz7AH7bjH9vgv3T9VkdYPkxTjBVMj46VGRR+c6olRggfWQU4AjPngo4rtXBjFjvwz4BIDukKm5nWatUWZ/h/z5CJ1gnVeaDErZOw2hzcM4+ctMMFO0DUw3y72jHU0GlWe69IkmMIsf5dG2WkyKFa6ZKJHYVfPE8fPU+/AGfWdvx2fGX2kasFLbwWXwjPr+Fk8xDGF3OkMrosHbfVU4qHUBwFjOm7S6hGhNnt+WwfyKIrTJlnr0TGCnX3H/Ps91OsBW/vxpQXSJhpF0Szbnz6RV39aRE9dLPdPv8BsS5gPFp2Hd7eEuu05mrFwxEu+cCjnsAxzvaN1Pmd+4z9TsKFsN6Dn93mYRi49p9b7modACJDpDJsWkYBf4bnTylz3afC2yHhv+3HFMwRaxX8PeXSuWcQ5Gq5ZRuZb1o6BT3XhP/X1HXVqhfoIDU+8u9Uzq/Pz46GLXGcWjvcnT0jx1/4KTSZZ/pUWWHBsuwfi6h+aOFgBQjIOjIqhhXuXGVuQ0Ba8XZrbMgd2Qq7ULQzX/o1KFq1j7uDroU9KwHfX8dbamHbfb9TVzq3hRV4zTINSql0/vLuVPazu9HzBAsCduAjm53AYwvgAX+Nsw1SGvPlTEz9uiqv3qFihwQJxChGfuLUXMRzmL/l5US5BrotoCr1CxiPSkV0UrpxvSveiIJapELbfXyHL/XRdLXZiVkaY+eDj8GPqtAoR2x3skabbvvMwMjiWE1S0Xs6zrVzY5Pb1YJANLHKTDRoSPm1h4E2TUr5ebX70qleRbSkANz8pezLjLErhdTvz++OQBAnJfyNNvLJNSNq3vdotz6Fuq0h3Ud0WOfuXWJYb0BWyJVC/Ztt6/erCIHBHk0gmHEfqBnXpyCvCdnwuzCfbOe6gzFjnb31LU0K/00/Dr5CtqzJtNOvwFpkBVqcdK+XQbp/XW9M+L4jP5o209wUtncwexe908sTj3ylDvydtlnJa0iBsRxvmEeDrsFQdqoO7YvgMRtnWYZ5oeoRb7Tbn+d+SsNSJOM1Y/uUS/z9Mtf7VMs9Vig6ZnXuXW1M6qJh9CcUTipLHHb6QMcLiB6FIm/Br+dKBUz98ohlqWrogdEz8JYDyFALb4C4nSerQj4uXJgfG/JFZBmOQRtrHXfnx4EIE8gxarJ/blZp/aXippvOBMan5sC74mlZwHfk0jsQglFR7eLU29V0QMSsuYCjmcRmC2+BtsBZLteF1ErzF1cLc74q05GoT1/0HWInzNZbYA8hTRrvqp3svfbqdSKeSgac04qvvkrG5D1sN9LRbw80qziB6TGRN77oqiFPn8DropOABJbrNdEcgUkISPRnqtt9ayvYAB5GjXIQvX+9ez9duqvUQsG6rSxyno8IEA+knD8Nn0ZSvZ+e6uKHpBIwICEzSuLFJBnMIKcXHSAVKnr3MzbMepOabff3qriByQWw1nrHxIJagSxFjsrxDkCUisHoj3X6lXvoEYQ9cKd9JNOugrI6NN3RQdegHYFN4JEYhxBigaQEAHJ3m+n/soLICYBISCd+IuAEBAC4uEvAkJACIiHvwgIASEgHv4iIASEgHj4i4AQEALi4S8CQkAIiIe/CAgBISAe/iIgBISAePiLgBAQAuLhLwJCQAiIh78ICAEhIB7+IiAEhIB4+IuAEBAC4uEvAkJACIiHvwgIASEgHv4iIASEgHj4i4AQEALi4S8CQkAIiIe/CAgBISAe/iIgBISAePiLgBAQAuLhLwJCQAiIh78ICAEhIB7+IiAEhIB4+IuAEBAC4uEvAkJACIiHvwgIASEgHv4iIASEgHj4i4AQEALi4S8CQkAIiIe/CAgBISAe/iIgBISAePiLgBAQAuLhLwJCQAiIh78ICAEhIB7+IiAEhIB4+IuAEBAC4uEvAkJACIiHvwgIASEgHv4iIASEgHj4i4AQEALi4S8CQkAIiIe/CAgBISAe/iIgBISAePiLgBAQAuLhLwJCQAiIh78ICAEhIB7+IiAEhIB4+IuAEBAC4uEvAkJACIiHvwgIASEgHv4iIASEgHj4i4AQEALi4S8CQkAIiIe/CAgBISAe/iIgBISAePiLgJQZIEkAcm+AgDTIzG4BEqkxgwXEvKJbgDTlAZAGORnbvbL326m/CIi/sheJ7hgIxC2BApKQWak7ZM8cDi1/gBixf+nWCJKQ6wIDJCnP2HVyCgEpsDKANMrNgaZY3QUkFI0h2C9IlRXgCBLtXooVJCCN7gjCFKuwykqxrlfB8RWQRmlVgOB716IzfQudarccDs1xvGGeiGD/DYHxH5AIAAlZS2TinLHYU06ApOplBNr0G8D/RkAjyFP4/pPsB2VI9n479RcB8VcZQBLyawToY92p/RxBmvT2eXy/kb2/Lsj5vbA5GynQ0wjMFv9HkPh2fP/1MnluSHIEBO0bDjsP7XrZ7dB+jyCP4Lun46QyWO+v845IQIJQVsB/iIC85Fug05aQrUgV7kegD9b7WdS1jigZQOLTEPBHkWK1SNU8/0cQI3YPIDmqyymWe1wqXUTb5upiutlHQNQJyinSG/F5Avw2ICd/ERB/lUkZGqQaQU646YIflh493rLrMTrVyr7Z++uCnN+rNI9BwJcDkE9cQFL+ARLfgWA/IkY0LhLtm5PfVko/FNFj0ZGb3Xb6NYK04jtb8PkqfO/uORwSAQlS+ozYIBcjQP4Eu2268knY8TmkCmm5RXrN15AK1SIwH/sPiNWKzrQWo8i5ItX9uuqrdBvsG2SIqkNgH9j+1SDbUdc8ju23Mdp2+ZiEgASnTMDr9WLeo7AWH0aSVgT6I3SeG5GC7IuRo6upVVruCIJAhOM34Gy/UQfIX0BSsM/Qoa6V4ccMytlvSH/QvqPR1mYf0qyUniRJyg5dD9bJITmko23+IiDBSc/MNMgPEKg1eqjvyeiR0MFergvN3OFo06ToGAT8IgRmve+A6KDPV0FPSig2DmlWV/N9LdWB7ZtkD7T3jFRC1qHt27t9YmnS9hm+6zHE4Dh10sohHVUiIEEqU6zXySh06qsRqNfVcN9NOFpgL6p5/NRVsmuOgW6vyoXDEOzvYgR5NxBAVNqmZ8miJ0vFzL3cvXbpeDMj771SgXYvVlO+egTo3ollG3y2Gtv58Ns+3fAUAcmHVN6rh/cG+Z1a4NMBV6OJkz6krS0tcFMDnVI16vSgRa0C4+/m2X+U4TnUHB0Jf7uon1TGv4nAvOnUIJafgLiplrkBHeoeCc0Z1bbfHHx2g/S3l0kosy6S1IujOzr1WVKnoRoo+G4VfP59/Gx/dULpht8ISL6kU4eETEKwzoatwOdNOrj3uqlA+7TA+bkzd/+qvqarXk5Efj6s50fiTr2GzMkI+F8Q+G0+jyBO4CMKEmu1GNFjxJimZo5yDrp9qwx0IfkpOvqD8MOH8E0q47OmnXzWrLfb1SIq4LgTfzPfXiojcyzMs0VA8qHs3NetSWoQ9KsQyD/p64PUwlhC3lLTtzrvTsgL7qxLAvYz/M3UHgR556NxnD8lejACfgc68ge+jx5tgf8QqdZVUmFOcHfe5cBnUi11YqmVA+CH2fDLlboGUz5DTQcI3tA+cy67eQH2BKxe+QzbI+xrZHCPUlECkl/pYV4FXKVctTIUQTwSwTwZAb5QA5OQawDP5diepUaMVIOM01PF6m+6lyJ0JOc7DjeHo0Y4H4F5OYA6xDVrG4K/TkLWQhlVPVC6M4qI6zPV/j/AZ8vgs3pZCLsAvluiazu1JqRGmWUSte9G7aLAcP/OF18RkPxLB3wlUoik7KEunkNq8CWVQqliUl1taj8gg3Qe7r+znO8bM2MPMebORNCf9H0tJNsi5laMIo0SqZme64zWztI+U2nXTTv57C5slc9qAcYzvvqMgJSvon1lfHQ0gtOs64UgCnUNiF44VAX7jRI6aZyMPnbXQrc8BxGQQipdm3RowTopaxSxlugOHAQc6U5QpTvBWgmbl8kEdZ9Iz9qWR58RkDKVG3iczUPmfCfNCgwQZa3u4uE76Gg/wsh1YC6XoRRQBKS8hU7qrKrf6qZDwaRZbemWupnqTQnHfioVsYPEMPpLFy+JL5AISHlLTfmicDZiFyBIm2E7ggVEmamu1VqDDvdr3SHaapI+Unwdg4CUudw7DGtmIUgrA7mBqsNOodOtdbpwVzdvTZg5cqdL44sFFgJCQepyEHV5eiS+IRO4YCFpdQp38xMNpmGdiQ54uEycPlymTt0ts5hZeGUBUvNtHO//EJCyk52+DfcoMeIq9WnNAyBtoESsFmfF3fqzhMxzpHLuETI6OkynXuPVuokq5vXo0qdAJjJqwUAJ18xz7sIkIOUmJxjj1ChiXoKO+kagC4cdmdNJWrDvV/RZWk0aqEI+VDNdqqKVMmbG/u69JYUp6NOzfRHzMQJSrlJphApQxFwpVWoUsVrzBEgqA6OqTXR9gtTLsF5Cx1kB+yOAuQ7//hWgOR+j3DkSmXe2Hm3yYeHY2Rg9zkOKdTeO4TUCUp5yi/XoEATqYgTu1byNHp+DRYGZnm6e55jqRIa1A6CodGxTln0cvJnKNmH/n+ppagJSxjJO7S8TYuP07JJhbteXiRQGlM+PMM6tvDuch0IUwqzWANaJCEiJqY9Uoyg2YnEU7U/kadq3nI2AlKTUukQodiaC9g5Gk3zOapWbEZASlPtoIJVqmUt18PI9q1U+RkBKVvtN213Cc48EJA/rHFwv7hW8Q/U2IyAlLfVEErWCbMQf4yhCQKidFY32lcmzvyzhmtMQwOfckaTQnao3GQHpFRoXV6vs5+iX7qj7zP1+4HX5GgHpBXKuSVLv+zCsn+uHPDgLZky3/AQkTEBKW9XqYXPWoRoSw3wxE+DCd7JStjZADPN2AlLqUncAhmaNk4i6Jiq2Kut6LYJCQMpebZd/V87BSGL+BPa/zjVKBe9opWouIOqpL7EbxZgdzvI1VaLqo2e3xs7eT0I1pr5HImJuRLA/AygcSboDSJX1vr7VIBIdk/ExVfLaRUZEh0pl7Aj9LhB1H4kzDdx2+TqtC4Do24/fFCO6QCqjPjx7mSoyVfeTimilvsEpbK4EJFt00NMdgLB4AxKxVIr1vL7luO3OSaqXSAXTuctv7Kx9MJrEkUvXYTRZo5+Skr6Xo/AdsXgtgvRKTfFOmjciy6dUL5NbwC8YKFWzDgMkP8RZ8T4E/y2MKJu5At+hqZG11blrsma6jI8OzvIl1UuF4J7aXybF95Zw1AAkP0bqcD86wXvOzU5W9o1H5Zt66Zu/cNIwrLclXPNLGaXfwkUwykuGujtxpBjxb6A+OQMd4jZ0iL9ju9WZFs6kXin3FttsK3wnDm7UUDUHThKmelDf76SypkIIR9mp/YPf1FXBkblqtut02C0A5SHYav0S0fRi45R0vdJhzdI7oHEWBbfjBPGKfnLLZFWYZ/xFlaHSoOyiX/2mHp+j1k/U+xFD8XMwuizFmXQV7HV0nHcBzXp0no/RebY4HclyZnkK3bF7Ys6r6FRa+SnauR5tW4V2LtbXtjkTHISDypK+hP6YQTL2pH0wshwkxtzDpTJqYST5T2c9Jdak35Cr11X0E0W2ubA4ZpSYOe+MV2A8gXYt0Y95nTR7hH5ABkV1QepFPkNl8vyDdT4ejh2JdOw4dCgLnes0/Uwq9SiicOxy2G/w8986pjpbsZt5hYStCwHF96QydpxMnj3RLcgpylOff7xnR3IePzpUDo0eIJPmHCKTY4fJRGusNgMpysQiNXVs6rIR9bKg8dF9O3irVrE8nJsqIXX0XNxdJF2/ZExKwBZlbRel6wxCQVEURVEURVEURVEURVEURVEURVEURVEURVEURVEURVEURVEURVEURVEURVEURZWk/h+WDPVLjwp/NgAAAABJRU5ErkJggg==";
    
function seededRandom(seed) {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
}

function gerarNumerosCartelaFixa(idCartela) {
    const cartela = { b: [], i: [], n: [], g: [], o: [] };
    let seed = idCartela * 123.45; // Semente única por ID

    const intervalos = {
        b: [1, 15], i: [16, 30], n: [31, 45], g: [46, 60], o: [61, 75]
    };

    for (let letra in intervalos) {
        let min = intervalos[letra][0];
        let max = intervalos[letra][1];
        let possiveis = Array.from({ length: max - min + 1 }, (_, i) => min + i);
        
        for (let j = 0; j < 5; j++) {
            let index = Math.floor(seededRandom(seed++) * possiveis.length);
            cartela[letra].push(possiveis.splice(index, 1)[0]);
        }
        cartela[letra].sort((a, b) => a - b);
    }
    return cartela;
}

// --- 2. GERAÇÃO DE PDF (4 POR PÁGINA A4) ---

async function gerarPDFCartelas() {
    const qtd = parseInt(document.getElementById('qtd-imprimir').value);
    if (!qtd || qtd <= 0) return alert("Digite a quantidade de cartelas.");

    const { jsPDF } = window.jspdf;
    const doc = new jsPDF('p', 'mm', 'a4');
    const logoBase64 = await carregarLogoBase64();

    document.getElementById('status-bingo').textContent = "Gerando PDF...";

    for (let i = 1; i <= qtd; i++) {
        if (i > 1 && (i - 1) % 4 === 0) doc.addPage();
        const dados = gerarNumerosCartelaFixa(i);
        desenharCartelaNoPDF(doc, i, dados, (i - 1) % 4, logoBase64);
    }

    document.getElementById('status-bingo').textContent = "PDF Gerado com sucesso!";
    doc.save(`cartelas-bingo-casa-de-negocios.pdf`);
}

function desenharCartelaNoPDF(doc, id, dados, indexPagina, logoBase64) {
    const largura = 90, altura = 110, margemX = 15, margemY = 15;
    const colPDF = indexPagina % 2, linPDF = Math.floor(indexPagina / 2);
    const x = margemX + (colPDF * (largura + 10));
    const y = margemY + (linPDF * (altura + 15));

    if (logoBase64) doc.addImage(logoBase64, 'PNG', x, y, 35, 0);
    
    doc.setFontSize(9);
    doc.setTextColor(100);
    doc.text(`Nº ${String(id).padStart(3, '0')}`, x + largura - 5, y + 5, { align: 'right' });

    const gridY = y + 15, tam = 16;
    const letras = ['B', 'I', 'N', 'G', 'O'];
    const raio = 3; // Ajuste aqui o nível do arredondamento

    // Cabeçalho BINGO com bordas arredondadas
    letras.forEach((l, i) => {
        const cor = (l === 'I' || l === 'G') ? COR_AMARELO : COR_AZUL;
        doc.setFillColor(...cor);
        
        // Trocamos rect por roundedRect
        // Os números 3, 3 no final são o raio do arredondamento (horizontal e vertical)
        doc.roundedRect(x + (i * tam), gridY, tam, tam, raio, raio, 'F');
        
        doc.setTextColor((l === 'I' || l === 'G') ? 0 : 255);
        doc.setFontSize(20);
        doc.text(l, x + (i * tam) + 8, gridY + 11, { align: 'center' });
    });

    doc.setTextColor(50);
    doc.setFontSize(16);
    for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
            const cX = x + (c * tam), cY = gridY + tam + (r * tam);
            doc.setDrawColor(200);
            
            // Se quiser as células de números arredondadas também:
            doc.roundedRect(cX, cY, tam, tam, 2, 2, 'S'); 
            // 'S' é apenas o stroke (contorno)
            
            if (r === 2 && c === 2) {
                if (imagemCentroBase64) doc.addImage(imagemCentroBase64, 'PNG', cX + 2, cY + 2, tam - 4, tam - 4);
                else { 
                    doc.setFontSize(8); 
                    doc.text("FREE", cX + 8, cY + 9, { align: 'center' }); 
                    doc.setFontSize(16); 
                }
            } else {
                const num = dados[letras[c].toLowerCase()][r];
                doc.text(String(num), cX + 8, cY + 11, { align: 'center' });
            }
        }
    }
}

function carregarLogoBase64() {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = function () {
            const canvas = document.createElement('canvas');
            canvas.width = this.width; canvas.height = this.height;
            canvas.getContext('2d').drawImage(this, 0, 0);
            resolve(canvas.toDataURL('image/png'));
        };
        img.onerror = () => resolve(null);
        img.src = 'logo.png';
    });
}

// --- 3. LÓGICA DO SORTEIO E VALIDAÇÃO ---

function iniciarJogoCompleto() {
    qtdCartelasJogando = parseInt(document.getElementById('qtd-jogando').value);
    if (!qtdCartelasJogando) return alert("Digite a quantidade de cartelas.");

    numerosDisponiveis = Array.from({ length: 75 }, (_, i) => i + 1);
    numerosSorteados = [];
    document.getElementById('numero-sorteado-display').textContent = '--';
    
    // Reset visual do tabuleiro
    const letras = ['b','i','n','g','o'];
    letras.forEach(l => {
        const container = document.getElementById(`cells-${l}`);
        container.innerHTML = '';
        const min = (l==='b'?1:l==='i'?16:l==='n'?31:l==='g'?46:61);
        for(let i=min; i<min+15; i++){
            const d = document.createElement('div');
            d.className = 'cell'; d.id = `num-${i}`; d.textContent = i;
            container.appendChild(d);
        }
    });

    jogoAtivo = true;
    document.getElementById('area-sorteio').classList.remove('escondida');
    const status = document.getElementById('status-bingo');
    status.textContent = `Monitorando cartelas de #1 a #${qtdCartelasJogando}...`;
    status.classList.remove('alerta-bingo');
}

function sortearNumero() {
    // Se o jogo não foi iniciado, avisa o usuário
    if (!jogoAtivo && numerosSorteados.length === 0) {
        alert("Clique em 'Iniciar Sorteio' primeiro!");
        return;
    }

    if (numerosDisponiveis.length === 0) {
        alert("Todos os números já foram sorteados!");
        return;
    }

    // Remove o alerta de Bingo anterior para poder continuar sorteando
    const status = document.getElementById('status-bingo');
    status.classList.remove('alerta-bingo');

    // Sorteio
    const idx = Math.floor(Math.random() * numerosDisponiveis.length);
    const num = numerosDisponiveis.splice(idx, 1)[0];
    numerosSorteados.push(num);

    // Atualização Visual
    document.getElementById('numero-sorteado-display').textContent = num;
    const el = document.getElementById(`num-${num}`);
    if (el) el.classList.add('drawn');

    // Validação
    const vencedor = verificarBingo();
    
    if (vencedor) {
        // NÃO travamos mais o jogoAtivo = false aqui, permitindo continuar
        status.textContent = `BINGO! Cartela nº ${vencedor.id} ${vencedor.motivo}! 🎉`;
        status.classList.add('alerta-bingo');
        
        // O alert é opcional. Se ele estiver atrapalhando a fluidez, 
        // você pode comentar a linha abaixo com //
        alert(`🎉 BINGO!\nCartela nº ${vencedor.id} ${vencedor.motivo}!`);
    } else {
        status.textContent = `Pedras: ${numerosSorteados.length}. Monitorando ${qtdCartelasJogando} cartelas...`;
    }
}
    

function verificarBingo() {
    const querLinhaColuna = document.getElementById('check-linha-coluna').checked;
    const querCheia = document.getElementById('check-cheia').checked;

    for (let id = 1; id <= qtdCartelasJogando; id++) {
        const dados = gerarNumerosCartelaFixa(id);
        const letras = ['b', 'i', 'n', 'g', 'o'];
        let matriz = [];

        // Monta matriz 5x5 de acertos
        for (let r = 0; r < 5; r++) {
            matriz[r] = [];
            for (let c = 0; c < 5; c++) {
                if (r === 2 && c === 2) matriz[r][c] = true; // Centro
                else matriz[r][c] = numerosSorteados.includes(dados[letras[c]][r]);
            }
        }

        if (querLinhaColuna) {
            // Linhas
            for (let r = 0; r < 5; r++) {
                if (matriz[r].every(v => v)) return { id, motivo: "fez LINHA" };
            }
            // Colunas
            for (let c = 0; c < 5; c++) {
                if ([0,1,2,3,4].every(r => matriz[r][c])) return { id, motivo: "fez COLUNA" };
            }
        }

        if (querCheia) {
            let total = 0;
            matriz.forEach(l => l.forEach(v => { if(v) total++; }));
            if (total === 25) return { id, motivo: "FECHOU A CARTELA" };
        }
    }
    return null;
}

function reiniciarJogo() {
    if (confirm("Reiniciar sorteio?")) iniciarJogoCompleto();
}
