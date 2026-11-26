"use client";

import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/shared/components/ui/input-group";

type PasswordInputProps = Omit<React.ComponentProps<typeof InputGroupInput>, "type">;

export function PasswordInput(props: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <InputGroup>
      <InputGroupInput {...props} type={visible ? "text" : "password"} />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          size="icon-xs"
          onClick={() => setVisible((value) => !value)}
          aria-label={visible ? "Sembunyikan password" : "Tampilkan password"}
          title={visible ? "Sembunyikan password" : "Tampilkan password"}
        >
          {visible ? <EyeOff /> : <Eye />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}
