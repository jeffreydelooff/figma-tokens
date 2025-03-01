import React, {ReactNode} from 'react';
import {styled} from '@/stitches.config';

export default function Label({
    htmlFor,
    children,
    disabled = false,
    css,
}: {
    htmlFor: string;
    children: ReactNode;
    disabled?: boolean;
    css?: object;
}) {
    const StyledLabel = styled('label', {
        fontSize: 12,
        lineHeight: 1,
        userSelect: 'none',
        variants: {
            isDisabled: {
                true: {
                    color: '$textDisabled',
                },
                false: {
                    color: '$text',
                },
            },
        },
    });
    return (
        <StyledLabel isDisabled={disabled} css={css} htmlFor={htmlFor}>
            {children}
        </StyledLabel>
    );
}
