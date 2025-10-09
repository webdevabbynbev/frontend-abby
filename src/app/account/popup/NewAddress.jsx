import React from "react";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
  SelectValue,
  Button,
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  TxtField,
} from "@/components";
import { FaUser } from "react-icons/fa";

export function NewAddress() {
  return (
    <div>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="primary" size="sm" iconName="Plus">
            Add new address
          </Button>
        </DialogTrigger>

        <DialogContent className="flex flex-col sm:max-w-[300px] md:max-w-[425px] h-[80%] overflow-y-auto overflow-x-hidden custom-scrollbar justify-start items-start p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>abcde</DialogTitle>
            <form className="flex flex-wrap gap-4 py-6">
              <span className="flex rounded-full px-4 py-2 bg-muted items-center justify-center gap-2 border-1 border-neutral-100">
                <FaUser className="h-3 w-3 text-neutral-300"/>
                <h6 className="title text-sm font-normal text-neutral-500">
                  Receiver
                </h6>
              </span>
              <div className="flex md:flex-row sm:flex-col gap-4">
                <TxtField
                  label="Full name"
                  variant="outline"
                  size="sm"
                  type="text"
                  placeholder="Enter your full name"
                />
                <TxtField
                  label="Phone number"
                  type="tel"
                  variant="outline"
                  size="sm"
                  placeholder="Enter your full name"
                />
              </div>

              <Textarea
                label="Street name"
                type="text"
                variant="outline"
                size="sm"
                placeholder="Enter your address"
              />
            </form>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </div>
  );
}
