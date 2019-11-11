---
inject: true
to: "<%= f ? 'src/controller/' + f + '/' + name + '.ts' : 'src/controller/' + name + '.ts' %>"
before: "} // END FILE"
---
{
console.log(1)
}