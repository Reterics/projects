'use client';
import styles from "./page.module.css";
import NavigationBar from "@/app/components/navigationBar";
import DraggableModal from "@/app/components/draggableModal";
import {useState} from "react";

export default function Home() {
    const [open, setOpen] = useState(true);
  return (
    <div className={styles.page}>
      <main className={styles.main}>
          <DraggableModal open={open} setOpen={setOpen} title={'Title'}>
              Modal
          </DraggableModal>

        <NavigationBar navItems={[]}/>
      </main>
    </div>
  );
}
