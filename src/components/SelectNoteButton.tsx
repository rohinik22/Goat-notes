"use Client";

import useNote from "@/hooks/useNote";
import { Note } from "@prisma/client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { SidebarMenuButton } from "./ui/sidebar";
import Link from "next/link";


type Props = {
    note: Note;
}

function SelectNoteButton({ note }: Props) {
    const noteId = useSearchParams().get("noteId") || "";

    const {noteText: selectedNoteText} = useNote();
    const [shouldUseGlobalNoteText, setShouldUseGlobalNoteText] = useState(false)
    const [localNoteText, setLocalNoteText] =useState(note.text);
    const [formattedDate, setFormattedDate] = useState("");


    useEffect(() =>{
        if (noteId === note.id) {
            setShouldUseGlobalNoteText(true);
        } else {
            setShouldUseGlobalNoteText(false);
        }
    }, [noteId, note.id]);

    useEffect(() => {
        if(shouldUseGlobalNoteText) {
            setLocalNoteText(selectedNoteText);
        }
    }, [selectedNoteText, shouldUseGlobalNoteText]);


      useEffect(() => {
    const date = new Date(note.updatedAt);
    setFormattedDate(date.toLocaleDateString("en-GB")); // fixed locale to avoid mismatch
  }, [note.updatedAt]);

    const blankNoteText= "EMPTY NOTE";
    let noteText = localNoteText || blankNoteText;
    if (shouldUseGlobalNoteText) {
        noteText = selectedNoteText || blankNoteText;
    }
  return (
    <SidebarMenuButton asChild className={`items-start gap-0 pr-12 ${note.id === noteId &&
        "bg-sidebar-accent/50"}`}>
            <Link href={`/?noteId=${note.id}`} className="flex h-fit flex-col">
            <p className="w-full overflow-hidden truncate text-ellipsis whitespace-nowrap">
                {noteText}
            </p>
            <p className="text-xs text-muted-foreground">
               {formattedDate} 
            </p>
            </Link>
        </SidebarMenuButton>
  )
}

export default SelectNoteButton;