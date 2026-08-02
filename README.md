# grapher

todo: mathquill?????
also mathquill uses times new roman as a default font fun fact

heres the file structure (also i accidentally did git rm -rf . without committing lmfao):
- loader.ts: loads js files
- main.ts: "entry point"
- entry.ts: entry/expression class, a line on the left bar
- entrylist.ts: list of entries

heres a parsing structure/tutorial/todo idfk:
- if nothing kill itself
- loop thru the entire string
  - find unnested inoperators (+, -)
- if brackets dont look right kill itself
- if no inoperators
  - find pre\post operators
  - else find parenthetical operators
  - else find { }
  - else kill itself
- ok back to inoperators
  - rule out fake minus signs
  - do order of operations on that shit
- recurse

wait negation is just a preoperator

TODO: fix the number system???
like i want cmplx to extend reals and reals to extend cmplx simul.
ummmm
yea laso make everything like make it yk