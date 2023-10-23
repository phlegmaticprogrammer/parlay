import { RX } from "./rx.js";

export function createExampleDocument<D, B, L>(rx : RX<D, B, L>) : D {

    let block = rx.block;
    let line = rx.line;
    function paragraph(s : string) : B {
        return block(line(s));
    }
    
    return rx.document(
        block( // comment block
        line("% This is a comment."),
        line("This is the second line of the comment."),
        line("And here is the third one.")
        ),
        block( // theorem 
            line("theorem Modus-Ponens: B"),
            paragraph("premise: implies(A, B)"),
            paragraph("premise: A")
        ),
        block(
            line("theorem Universal-Introduction:"),
            paragraph("for-all(x. A[x])"),
            paragraph("premise: x. A[x]")
        ),
        block(
            line("theorem Truth-1: true")
        ),
        block(
            line("theorem Truth-2: implies(A, equals(A, true))")
        ),
        block(
            line("theorem Implication-1: implies(A, implies(B, A))")
        ),
        block(
            line("theorem Implication-2:"),
            block(
                line("implies"),
                paragraph("implies(A, implies(B, C))"),
                paragraph("implies(implies(A, B), implies(B, C))")
            )
        ),
        block(
            line("theorem Universal-1: implies(for-all(x. A[x]), A[x])"),
        ),
        block(
            line("theorem Universal-2:"),
            block(
                line("implies"),
                paragraph("for-all(x. implies(A, B[x]))"),
                paragraph("implies(A, for-all(x. B[x]))")
            )
        ),
        paragraph("theorem Equality-1: equals(x, x)"),
        paragraph("theorem Equality-2: implies(equals(x, y), implies(A[x], A[y]))")
    );
}