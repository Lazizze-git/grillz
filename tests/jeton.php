<?php
require __DIR__ . "/../spam-filter.php";
$s = (int) $argv[1];
echo $s . "." . antispam_somme($s), "\n";
