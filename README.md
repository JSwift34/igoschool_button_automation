## Button automation user script for training system at https://internetgoschool.com/

This script helps users to use training more comfortable, without unnecessary clicks and allows being more focused on solving problems.
The script requires from user solve the problem without mistake before continue to next problem based on rules defined bellow.
When problems gets to "correct" state but user made mistake on way, the problem is restarted to beginning state.

### Instalation

If you are new to user scripts, please read first https://openuserjs.org/about/Userscript-Beginners-HOWTO
After that the script can be installed through
https://openuserjs.org/scripts/JSwift34/Automated_submit_buttons
page.


### Configuration options

 **(ok, restart, mistake)**
 times defined in milliseconds to wait before script clicks on a specific button to continue to next problem or restart problem.

 **word_const**
 If problem contains comment then the number of words in it is multiplied by this constant and added to default timeout to ensure that user has enough time to read the comment.

**wait_before_check**
Delay between user clicks on board and checking status of the problem.
The Minimal value should not be less than 500 ms to ensure that all animations finish before the click.

*current_reviewing_regime*
Review regime can at the moment run in two options:
normal (default) and strict.

In **strict** there are only two options for continuation to next problem.
If a user makes even one mistake, a problem is "forgotten`, otherwise is "hard".

Rules for the **normal** regime:

When user solves the problem without mistake and:
and it requires only one click at the board, the problem is "`easy`", otherwise: "`good`".

If user made one mistake, problem was "`hard`" if more than one mistake script was "`forgotten`".

### Contribute

- todo

### TODO

- work on mobile firefox

### Donate

If you find this script useful consider visit http://patreon.com/ppms