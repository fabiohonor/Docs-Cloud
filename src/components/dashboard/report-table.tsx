
'use client';

import * as React from 'react';
import type { Report, ReportStatus } from '@/lib/types';
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuPortal,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, CheckCircle, XCircle, FileSignature, Download, FileText, ImageIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const logoDataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAeMAAABsCAYAAAD9nC6yAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAEfFSURBVHhe7Z1/bBzVfef/7/1/z/v3/v2cZ+e+nK1jO7Zt27ZtO3bsxEpcpChSpEhxpNhJihS1lZSoAmlBq8RLoKCFLhVoARVoARWCHkhp0VIoVBCqgAhpYSUg0BJIQCEFghYq0A/y5b3/e3fmO/PNu/vu7OzsXLbO0/N5yNnZ2dn97t2bN9+b+eabGYYYxhiLxG0gGGOMLFhJMMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBMYYWQaSBM-DD2Cj4uU+w7V9u+uL/x9b1C5J7b19UaE+tI9o0eBwS3/L2wTfC79p6u7o7u7q9+1P/T5JqR2zV5aMhE8t7a7gL/7W6a+51G/t6c07mD9XqE/k/8t/L+3j/l/aXn/l/bX160Xl3X1xK7+yPp33g4k3L0oK3f5v05+b/D+b9jW3u7yv4H8J/Ff/v4D/t5X9v/T+6l0lK7+yZc4YcZ+3qO9r75Wp2tO+j9j4N/q3Ld+8k4k3b+o+L/O+qG6O7u9e5D17zKzRzN+x7N+x7O/1u3/D6t0lq3eUv2lSjYd/D+q39B5P4X0H/l+X/N23e1n+b9vVb+7q23l3V3f1/C/3Ptb5nSYraRdbn4lHlvdV/+f9O/u+wfe9j/N+w/R/gL2v9r/9f/X+N/0tKv9X5f2t710tKv8n8X+b9/S3+l/Vvrdf4t6p01/S/5G1vC+L8v4pS1a6yYSR8k/i+j/9u0//V6/V9Rj937R/X9P27t6v7v+qf6vU7+qf4v+7/Gf2P/691d/R3vfr8n/1u7+Bf+v8b/O3u+893sJ/e+1/X32ftc+7xliYk7+L8v+l/r39fu9xP9r/S/q9y3zXk09N29V96Pq3kX+b+X/NfS/hvbv2q8mH9q0b8n/Dfj//7W/8H+P/6Tf/92kG4u4e9n9h/zfY/2v8X9O/9/X7l7f/tV9N4j+1/+v7Wd1dXf3/a/8n9n/Xk2lI3aP+T+R/0tKv9b972p3tXvbV/d8aP2+tX+T/t9V9/6X9v+t01/o/2v+t9X+1fbvUf+q/g+k/7cSDZc6t/cva/+3+P+W962m/zdr/zvZ+332Ptv8Z4yJa9r3ZfS/xv+x/j+R/5v2b6P/L0n9L+v39Xv7+t17b+3vW/a9pX2bpE5dv7evb+3q2pLdXXP9t9p9D+t0t2v3v93/tWn/r6l2t6f1X1Lr2P+v8b8q9f+a/N9p+9/y9rvk/e+S+u8i/f4t6bf+v/V6Xk3/m1S393X61/b3Wb/H2t+r//e3u/c1/V+r7W/uP5uL3F3W9u/a/6v9b2v736P1n8P/a3u/rf/3tXt7v7V/m3rvav+r/c+yftd8vyY+i4v839r+V/p9p/3b+D/m/Wl7/2vr39fvWfuvy99b/y91763t/y3/97x313z/VpWudW7+L/Xfa/zP+F/W/q7/P/5vav2vpP1P8t9Z+99l/X2mH2JibO7eZetv+X9B/S/r/w3/u+j/qfP+W9N+R+29rf3f8L/A/o+t7X/D/1P6Xk0/5/w/8P/w+r/eG8L8v+j/NfVvtv+/1L/V9f8t6/8d/W/Vfl7l72v9D+T9p/p+9/y/u9rP0v9b/G/l+l31/u/2vtP6v9P3v6t+T/1v+D+X+N/7e8/1f6P+l//8+R9N/6f5D+T/L/w/6P+r/w/xv8v23/V/a/xv43af/r6v9N/b9h/X9L/9+g/a+p/zfrf5v6v9n/1v/N2v/9/W9r/99l/a+tf433f5/63+3/ZfX/bftfa39L/S9r/0v8X9D/ZfW/yv63e/+38H9Z+7/N+1/l/2Xv/539r9P/rff/rf3f6X8X/W+2/7e0/63+L2v/NfV/Wfvf5v6v+3/L+t+m/239v2H9v0D7X0n/W6r/NfnfUv/r/F/R/1v+D2v/S/1/nf9Pkv7vU/+b1P+m/a/pf7L+1/V/a/83av/X0/+t/Z+i/X/L+v9U9b/J/l+j/zdr/6/R/4P8f1D/P0H/L/x/Uf+/xv+b/t/l/wfZ/wb9vyH/H5X+d/T/r/H/hv+/x/+t/H+J/H/K/w/7X5D+L2n/O/n/Evk/Wv/v6/9H+P+B/F+l/R+j/5v2b9D+l6T+r6b+T+r/hvU/oP+Ttf/V+X/J/d9R/+t8/xP5v0r7P+D/K+X/j/H/gv432X/D+r+a+l/U/y38v27932n/6/L/W+r/xv7v8P+j/q/8f0D+T9r/Jf3fX/t/y/+vpf97+L/L/vf1f1v7X+P+t9b/h/2vUPvfrP0vdf/b+L8t/1/U/zf3P6v+1/rf1f7P9f9t/N+y/n+A9r+S/rdT/4v+/yb938D/df4Pq/8L2v/u+v+W9X/z9D+T/n+N/N+s/z/V/2Xv/wf9X9v/N+T/S6T/BfT/hvo/qv9D9//a/r+h/3fyf4v8v6X93+n/1/g/pv+D/j/D/zf2f0f/r+n/j/H/Ev//ifw/R/w/R/x/q/w/Rv+/ov0fUv+/p/0/qv/P+f/L/v+m/L/k/e/s/6n+X67/d/V/lfzfZv/Xt/+r83+3+v/K/u/p/1v9X6H/BfR/ofx/SP83av9b/P+C/r+j/3v4v07/d2n/d/j/if5v6f9O//dq/2+5/5v2/xX9P8n+b2r/2/q/Rfs/0/9F+z/H/z/k/1v7X6T/F+j/Nfo/xf4P9P+L/N9V/V+t/2vt/0f/V9n/5v1f7X9D/5tVv/fwf7n2/4L+t2v/Nfrf0/+1/n/T/1f6P+P+b8n/D/pf7f/X9v8t7f/W/h9R/x+j/j9F/d+g/r9C/W9V/S9S/S+y/2/5/9L2v6n+t9h/r+P/Tfb/lfo/7v+t/X+N/D+N/n+d/n+D/l/v/430P6f/L/B/pfY/bft/qP5v9/+m/v+S/T+k/d9V/x/l/v9V/S91/zv8f237v9f+t/H/5/n/pvvfw/6vtP+7+P8t/d/k/3fy/+X+f8X/r/H/x/i/S/zfpv5vUv/39v8d/X/N/h+l/V+t/S/2P2X938H/F/B/i/zfqv6vUP9Xsv+N/j9P/D/k/rfa/73+L+r/hP9P8n/V/g/q/73+d/l/mfwfV/+/8f/j/D/K/m/Rvu/Tfyf6v9P2/8J/x+n/u/m/0X/d/X/J+X/Wfrf1/4P8P9593/F+l/n/k/S/m+p/zfrf5v639X+z9P/Jfo/Sf+X9f8J/Z9R/+tVv3v5X9L+d9X+9/r/lvo/Sf8X+L9t/c+pf5X9v8H+r2r/X+T/h/zfqP5vtf97/H+p/9f2v8X+r+n/D/l/2v4P8v+8/W/a/47+r6b+T+j/a/q/yf63sP8t9r9R/2v6v9P/Z+j/lvo/r/1foP2vpP+L9L9t/b+r/nfwf7H+3+b+72j/l+3/qvN/kvzf2/53kv5X638n/S/of7/2f4X6f5/+/6H8f9L/BfS/Ufq/2v5X6P8W+7/P/hfY/139X03/BfS/r/87+X+J/P/u/q/m/jfS/m+p/w/6P+7/9/j/kPzf0/5X8v8h83/c/1+S/u+p/xvq/739P8D/8+7/qvXfr/3/y/pfUf+/2f9V/S91/1vpf7n+L2r/+/pfUP/r8//m+l9S/x/l/3v6/wH+j7r/Zf//qP2vyP+P6H8t/V9S/+v1/wv9L/J/pfS/xf2vpP2vpf3f1f6v1f+N/l/U/y32v2v7v2H/N/R/pfz/W/j/svd/n/l/3v6vs/+7+/9J/n9v/7fV/i3q/7X+32T/u/T/hv1/Tfu/Uf+X2f9q/S+y/938v93/lfzfpv9P6H+T+j/a/y/R/w36v5z+/yb9f6v+/9j/tfxf5P+L+T9K/5fS/q+j/3/a/83av2r/l9T/jfS/nvy/U/qf8//j7f+K9D/P/h/i/2H//wL/P8z/o/L/Evpfr/0fVf8v8H/R/tfy/yLyfyHzf+3+D/f/JvU/rf3vq/2f5v+/8L/c/7fwv9T+d/h/w/5fUP8/7X8n/V+j/rfqf5P+D+L/l/R/jfS/Q/p/SftfZf8b9n/B/lfq/5T9r9r/3fq/U/u/V/9Xp/5/lvR/pfxfZv8v639X/a/m/n/S/9/V/8/yf1f/B/B/pf5fy/r/Qf+/wv538H/F+l+j/xvS/3vyf5b8P+H+l/N/gv4vav97/H+N+l/T/g/7/y38LzP/i+xfi+wP2f9W9X+V/N+x/rf1/+X9r6v/S/S/kfqvsv8d/Z9q/9fo/wb9H1X//xb5P8H/2y//y5k0WpUAAAAASUVORK5CYII=';

const statusStyles: Record<ReportStatus, string> = {
  Aprovado: 'bg-green-100 text-green-800 border-green-200',
  Pendente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  Rejeitado: 'bg-red-100 text-red-800 border-red-200',
  Rascunho: 'bg-gray-100 text-gray-800 border-gray-200',
};

const formatReportContent = (content: string): string => {
  let data;
  try {
    // First, try to parse the content as JSON
    data = JSON.parse(content);
  } catch (e) {
    // If it fails, it's likely plain text. Format it with line breaks.
    return content.replace(/\n/g, '<br />');
  }

  // If parsing is successful, format the JSON object into HTML
  let htmlContent = '';
  
  // A mapping of expected keys to human-readable titles
  const keyMap: Record<string, string> = {
    paciente: 'Paciente',
    laudo: 'Laudo',
    exame: 'Exame',
    medico: 'Médico',
    crm: 'CRM',
    achados: 'Achados',
    conclusao: 'Conclusão',
    observacoes: 'Observações',
    resultados: 'Resultados',
    observacao: 'Observação', // Handle alternative key
  };

  const processValue = (value: any): string => {
    if (typeof value === 'string') {
      return `<p style="color: #333;">${value.replace(/\n/g, '<br />')}</p>`;
    }
    // Handle nested objects (like a list of findings)
    if (typeof value === 'object' && value !== null) {
      let list = '<ul style="list-style-position: inside; padding-left: 0; margin-top: 5px;">';
      for (const key in value) {
        // Make the list item key more readable
        const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        list += `<li style="margin-bottom: 5px;"><strong>${formattedKey}:</strong> ${value[key]}</li>`;
      }
      list += '</ul>';
      return list;
    }
    // Fallback for other data types
    return `<p style="color: #333;">${String(value)}</p>`;
  };

  // Process all keys found in the data object
  for (const rawKey in data) {
    if (Object.prototype.hasOwnProperty.call(data, rawKey)) {
        // Use the mapped title if available, otherwise format the raw key
        const title = keyMap[rawKey.toLowerCase()] || rawKey.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        // Add a styled header for each section
        htmlContent += `<h3 style="font-size: 16px; font-weight: bold; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px;">${title}</h3>`;
        
        // Process and add the content for that section
        htmlContent += processValue(data[rawKey]);
    }
  }

  // If after all processing, htmlContent is still empty, fallback to plain text format
  if (htmlContent.trim() === '') {
      return content.replace(/\n/g, '<br />');
  }

  return htmlContent;
};


export function ReportTable() {
  const [reports, setReports] = React.useState<Report[]>([]);
  const [isDownloading, setIsDownloading] = React.useState<{id: string, format: 'pdf' | 'jpg'} | null>(null);
  const { toast } = useToast();

  React.useEffect(() => {
    if (!db) {
      toast({
        variant: 'destructive',
        title: 'Erro de Configuração',
        description:
          'A conexão com o banco de dados não foi estabelecida. Verifique as credenciais do Firebase em seu arquivo .env.',
      });
      return;
    }
    const q = query(collection(db, 'reports'), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const reportsData: Report[] = [];
        querySnapshot.forEach((doc) => {
          reportsData.push({ id: doc.id, ...doc.data() } as Report);
        });
        setReports(reportsData);
      },
      (error) => {
        console.error('Error fetching reports: ', error);
        toast({
          variant: 'destructive',
          title: 'Erro de Conexão',
          description:
            'Não foi possível buscar os laudos. Verifique sua configuração do Firebase e as regras de segurança do Firestore.',
        });
      }
    );

    return () => unsubscribe();
  }, [toast]);

  const getFormattedDate = (dateString: string) => {
    if (!dateString) return 'Data Inválida';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
    } catch {
      return 'Data Inválida';
    }
  };

  const handleDownload = async (report: Report, format: 'pdf' | 'jpg') => {
    setIsDownloading({ id: report.id, format });

    const reportElement = document.createElement('div');
    reportElement.style.position = 'absolute';
    reportElement.style.left = '-9999px';
    reportElement.style.width = '800px';
    reportElement.style.padding = '40px';
    reportElement.style.backgroundColor = 'white';
    reportElement.style.color = '#111';
    reportElement.style.fontFamily = 'Arial, sans-serif';

    const formattedContent = formatReportContent(report.content);

    reportElement.innerHTML = `
        <div style="text-align: center; margin-bottom: 30px;">
            <img src="${logoDataUri}" alt="Hospital São Rafael" style="width: 320px; height: auto; object-fit: contain;"/>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
            <div>
                <h2 style="font-size: 12px; color: #555; margin: 0 0 5px 0; font-weight: bold; text-transform: uppercase;">Paciente</h2>
                <p style="margin: 0; font-size: 16px;">${report.patientName}</p>
            </div>
            <div style="text-align: right;">
                <h2 style="font-size: 12px; color: #555; margin: 0 0 5px 0; font-weight: bold; text-transform: uppercase;">Data do Laudo</h2>
                <p style="margin: 0; font-size: 16px;">${getFormattedDate(report.date)}</p>
            </div>
        </div>

        <div style="margin-bottom: 25px; padding-bottom: 15px; border-bottom: 1px solid #eee;">
            <h2 style="font-size: 12px; color: #555; margin: 0 0 5px 0; font-weight: bold; text-transform: uppercase;">Tipo de Laudo</h2>
            <p style="margin: 0; font-size: 16px;">${report.reportType}</p>
        </div>
        
        <div>
            <h2 style="font-size: 20px; font-weight: bold; color: #111; margin-bottom: 20px; text-align: center;">Conteúdo do Laudo</h2>
            <div style="font-size: 16px; line-height: 1.6;">${formattedContent}</div>
        </div>

        ${report.signedBy ? `
        <div style="margin-top: 80px; text-align: center;">
            <p style="font-size: 16px; margin: 0; line-height: 1;">_________________________</p>
            <p style="font-size: 16px; margin: 8px 0 0 0;">${report.signedBy}</p>
            <p style="font-size: 14px; color: #555; margin: 4px 0 0 0;">Assinado em: ${getFormattedDate(report.signedAt || '')}</p>
        </div>
        ` : ''}
    `;

    document.body.appendChild(reportElement);

    try {
        const canvas = await html2canvas(reportElement, { scale: 2, useCORS: true });
        const imgData = canvas.toDataURL('image/jpeg', 0.9);

        if (format === 'jpg') {
            const link = document.createElement('a');
            link.href = imgData;
            link.download = `laudo-${report.id}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else if (format === 'pdf') {
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();
            const imgWidth = canvas.width;
            const imgHeight = canvas.height;
            const ratio = imgHeight / imgWidth;
            
            let newImgWidth = pdfWidth - 20; // A4 width in mm with margin
            let newImgHeight = newImgWidth * ratio;
            
            if (newImgHeight > pdfHeight - 20) {
              newImgHeight = pdfHeight - 20;
              newImgWidth = newImgHeight / ratio;
            }

            const x = (pdfWidth - newImgWidth) / 2;
            const y = 10;

            pdf.addImage(imgData, 'JPEG', x, y, newImgWidth, newImgHeight);
            pdf.save(`laudo-${report.id}.pdf`);
        }
    } catch (error) {
        console.error("Erro ao gerar o arquivo:", error);
        toast({
            variant: "destructive",
            title: "Erro no Download",
            description: "Não foi possível gerar o arquivo para download.",
        });
    } finally {
        document.body.removeChild(reportElement);
        setIsDownloading(null);
    }
  };

  const handleStatusChange = async (id: string, status: ReportStatus) => {
    if (!db) return;
    const reportRef = doc(db, 'reports', id);
    try {
      await updateDoc(reportRef, {
        status,
        signedBy: status === 'Aprovado' ? 'Dr. Alan Grant' : null,
        signedAt: status === 'Aprovado' ? new Date().toISOString() : null,
      });
      toast({
        title: 'Status Atualizado',
        description: `O status do laudo ${id} foi atualizado para ${status}.`,
      });
    } catch (error) {
      console.error('Failed to update status in Firestore', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível atualizar o status.',
      });
    }
  };

  const handleSign = async (id: string) => {
    if (!db) return;
    const reportRef = doc(db, 'reports', id);
    try {
      await updateDoc(reportRef, {
        signedBy: 'Dr. Alan Grant',
        signedAt: new Date().toISOString(),
      });
      toast({
        title: 'Laudo Assinado',
        description: `O laudo ${id} foi assinado digitalmente.`,
      });
    } catch (error) {
      console.error('Failed to sign report in Firestore', error);
      toast({
        variant: 'destructive',
        title: 'Erro',
        description: 'Não foi possível assinar o laudo.',
      });
    }
  };

  return (
    <div className="rounded-lg border shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Paciente</TableHead>
            <TableHead>Tipo de Laudo</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {reports.map((report) => (
            <TableRow key={report.id}>
              <TableCell className="font-medium">{report.patientName}</TableCell>
              <TableCell>{report.reportType}</TableCell>
              <TableCell>{getFormattedDate(report.date)}</TableCell>
              <TableCell>
                <Badge variant="outline" className={cn('font-semibold', statusStyles[report.status])}>
                  {report.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Ações</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => alert('Visualizando laudo ' + report.id)}>Ver Laudo</DropdownMenuItem>
                    
                    <DropdownMenuSub>
                      <DropdownMenuSubTrigger disabled={!!isDownloading}>
                        <Download className="mr-2 h-4 w-4" />
                        <span>Baixar Laudo</span>
                      </DropdownMenuSubTrigger>
                      <DropdownMenuPortal>
                        <DropdownMenuSubContent>
                          <DropdownMenuItem onClick={() => handleDownload(report, 'pdf')} disabled={!!isDownloading}>
                            {isDownloading?.id === report.id && isDownloading?.format === 'pdf' ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <FileText className="mr-2 h-4 w-4" />
                            )}
                            <span>PDF</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDownload(report, 'jpg')} disabled={!!isDownloading}>
                            {isDownloading?.id === report.id && isDownloading?.format === 'jpg' ? (
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <ImageIcon className="mr-2 h-4 w-4" />
                            )}
                            <span>JPG</span>
                          </DropdownMenuItem>
                        </DropdownMenuSubContent>
                      </DropdownMenuPortal>
                    </DropdownMenuSub>

                    <DropdownMenuSeparator />
                    {report.status === 'Pendente' && (
                      <>
                        <DropdownMenuItem onClick={() => handleStatusChange(report.id, 'Aprovado')}>
                          <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                          Aprovar
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusChange(report.id, 'Rejeitado')}>
                          <XCircle className="mr-2 h-4 w-4 text-red-600" />
                          Rejeitar
                        </DropdownMenuItem>
                      </>
                    )}
                    {report.status === 'Aprovado' && !report.signedBy && (
                       <DropdownMenuItem onClick={() => handleSign(report.id)}>
                         <FileSignature className="mr-2 h-4 w-4 text-primary" />
                         Assinar Digitalmente
                       </DropdownMenuItem>
                    )}
                     {report.signedBy && (
                       <DropdownMenuItem disabled>
                         <FileSignature className="mr-2 h-4 w-4" />
                         Assinado
                       </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
