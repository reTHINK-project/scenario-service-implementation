#!/bin/sh

for i in `ls UML*`
do
	plantuml $i
done

