#!/bin/bash
git status > /home/vlopez/txreigroup-web/git_debug_output.txt 2>&1
git branch >> /home/vlopez/txreigroup-web/git_debug_output.txt 2>&1
git log -n 5 --oneline >> /home/vlopez/txreigroup-web/git_debug_output.txt 2>&1
git remote -v >> /home/vlopez/txreigroup-web/git_debug_output.txt 2>&1
