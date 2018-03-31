#!/bin/sh
for dir in UserStudyLog/* ;
	do echo $dir;
	for file in $dir/* ;
		do {
			echo $file;
			python parser.py $file;
		}
	done
done