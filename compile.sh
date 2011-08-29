js/closure-library/closure/bin/build/closurebuilder.py\
 --root=js/closure-library/\
 --output_mode=compiled --compiler_jar=../closure-compiler/build/compiler.jar\
 --compiler_flags="--compilation_level=ADVANCED_OPTIMIZATIONS"\
 --compiler_flags="--warning_level=VERBOSE"\
 --compiler_flags="--summary_detail_level=3"\
 --compiler_flags="--define='goog.DEBUG=false'"\
 --compiler_flags="--define='DEBUG=false'"\
 --compiler_flags="--language_in=ECMASCRIPT5_STRICT"\
 --compiler_flags="--output_wrapper='(function(){%output%}).call(window)'"\
 --namespace="tetris"\
 --output_file=min/tetris.min.js\
 js/Board.js\
 js/Piece.js\
 js/main.js
