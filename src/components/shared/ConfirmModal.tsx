import { ReactNode } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export interface ConfirmModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string | ReactNode;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    icon?: ReactNode;
    variant?: "default" | "destructive";
    isLoading?: boolean;
}

export function ConfirmModal({
    open,
    onOpenChange,
    title,
    description,
    confirmText = "Confirm",
    cancelText = "Cancel",
    onConfirm,
    icon,
    variant = "destructive",
    isLoading = false
}: ConfirmModalProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm text-center">
                <DialogHeader>
                    {icon && (
                        <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${variant === "destructive" ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"}`}>
                            {icon}
                        </div>
                    )}
                    <DialogTitle className="text-center">{title}</DialogTitle>
                </DialogHeader>
                {description && (
                    <div className="py-2">
                        <p className="text-sm text-muted-foreground mb-2 px-2 text-center">
                            {description}
                        </p>
                    </div>
                )}
                <DialogFooter className="flex gap-3 sm:justify-center mt-2">
                    <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} className="flex-1" disabled={isLoading}>
                        {cancelText}
                    </Button>
                    <Button
                        type="button"
                        variant={variant}
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        {isLoading ? "Processing..." : confirmText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
